package me.vystworld.bridge;

import org.bukkit.Bukkit;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;
import org.bukkit.scheduler.BukkitTask;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class VystWorldBridge extends JavaPlugin {
    private HttpClient http;
    private String website;
    private String secret;
    private BukkitTask task;

    @Override public void onEnable() {
        saveDefaultConfig();
        FileConfiguration c = getConfig();
        website = c.getString("website-url", "").replaceAll("/+$", "");
        secret = c.getString("bridge-secret", "");
        if (website.isBlank() || website.contains("YOUR-SITE") || secret.length() < 32 || secret.startsWith("CHANGE-")) {
            getLogger().severe("Configure website-url and a long bridge-secret in config.yml. Delivery polling disabled.");
            return;
        }
        http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
        long period = Math.max(15, c.getLong("poll-seconds", 30));
        task = new BukkitRunnable() {
            @Override public void run() { poll(); }
        }.runTaskTimerAsynchronously(this, 40L, period * 20L);
        getLogger().info("VystWorld bridge enabled.");
    }

    private void poll() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(website + "/api/minecraft/pending"))
                .timeout(Duration.ofSeconds(12))
                .header("x-vystworld-secret", secret)
                .GET().build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                getLogger().warning("Website poll failed: HTTP " + response.statusCode());
                return;
            }
            Matcher rows = Pattern.compile("\\{[^{}]*\"id\"\\s*:\\s*\"([0-9a-fA-F-]{36})\"[^{}]*\"minecraft_nick\"\\s*:\\s*\"([A-Za-z0-9_]{3,16})\"[^{}]*\"delivery_command\"\\s*:\\s*\"([A-Za-z0-9_ {}0-9]+)\"[^{}]*}").matcher(response.body());
            while (rows.find()) {
                String orderId = rows.group(1);
                String nick = rows.group(2);
                String command = rows.group(3).replace("{player}", nick).trim();
                if (!command.matches("[A-Za-z0-9_ ]{1,100}") || command.contains("..")) {
                    getLogger().warning("Skipped unsafe delivery command for order " + orderId);
                    continue;
                }
                Bukkit.getScheduler().runTask(this, () -> {
                    Bukkit.dispatchCommand(Bukkit.getConsoleSender(), command);
                    Bukkit.getScheduler().runTaskAsynchronously(this, () -> ack(orderId));
                });
            }
        } catch (Exception e) {
            getLogger().warning("Could not poll website: " + e.getClass().getSimpleName());
        }
    }

    private void ack(String orderId) {
        try {
            String json = "{\"orderId\":\"" + orderId + "\"}";
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(website + "/api/minecraft/ack"))
                .timeout(Duration.ofSeconds(10))
                .header("x-vystworld-secret", secret)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8)).build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) getLogger().warning("Could not acknowledge order " + orderId + ": HTTP " + response.statusCode());
        } catch (Exception e) {
            getLogger().warning("Order acknowledgement failed: " + e.getClass().getSimpleName());
        }
    }

    @Override public void onDisable() {
        if (task != null) task.cancel();
    }
}
