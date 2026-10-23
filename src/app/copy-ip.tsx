"use client";
export default function CopyIp(){return <button className="btn" style={{padding:"7px 10px"}} type="button" onClick={async()=>{try{await navigator.clipboard.writeText("vystworld.aternos.me");}catch{window.prompt("Скопируй IP сервера:","vystworld.aternos.me");}}}>Скопировать IP</button>}
