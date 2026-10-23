export type Product = {
  id: string;
  name: string;
  category: "rank" | "items";
  price: number;
  description: string;
  badge?: string;
  command: string;
};

export const catalog: Product[] = [
  { id: "vip", name: "VIP", category: "rank", price: 149, description: "Стартовая привилегия на сервере", badge: "Популярное", command: "lp user {player} parent add vip" },
  { id: "premium", name: "PREMIUM", category: "rank", price: 299, description: "Больше возможностей и особый статус", command: "lp user {player} parent add premium" },
  { id: "legend", name: "LEGEND", category: "rank", price: 499, description: "Максимальный статус VystWorld", badge: "Топ", command: "lp user {player} parent add legend" },
  { id: "starter", name: "Стартовый набор", category: "items", price: 79, description: "Набор предметов для начала игры", command: "give {player} iron_ingot 32" },
  { id: "diamonds", name: "Алмазы ×16", category: "items", price: 99, description: "16 алмазов для твоих приключений", command: "give {player} diamond 16" },
  { id: "gold", name: "Золотой набор", category: "items", price: 129, description: "Золотые слитки и полезные ресурсы", command: "give {player} gold_ingot 32" }
];
export function findProduct(id: string) {
  return catalog.find((p) => p.id === id);
}
