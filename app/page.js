"use client";

import { useEffect, useRef, useState } from "react";
import "./style.css";

export default function Home() {
  const [task, setTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agent-history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      localStorage.removeItem("agent-history");
    }

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function saveHistory(nextHistory) {
    setHistory(nextHistory);
    localStorage.setItem(
      "agent-history",
      JSON.stringify(nextHistory)
    );
  }

  function speakAnswer(text) {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "az-AZ";
    speech.rate = 0.95;
    speech.pitch = 1;

    speech.onstart = () => setSpeaking(true);
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(speech);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Bu brauzer səs tanımanı dəstəkləmir. Chrome və ya Safari istifadə et."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "az-AZ";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error !== "no-speech") {
        alert("Səs tanınmadı. Yenidən cəhd et.");
      }
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || "";

      setTask(transcript);
    };

    recognition.start();
  }

  async function submitTask(event) {
    event.preventDefault();

    const cleanTask = task.trim();

    if (!cleanTask || loading) return;

    setLoading(true);
    setAnswer("");
    stopSpeaking();

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task: cleanTask
        })
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Server düzgün cavab vermədi.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Server xətası baş verdi."
        );
      }

      const result =
        data.answer || "Cavab alınmadı.";

      setAnswer(result);
      speakAnswer(result);

      const nextHistory = [
        {
          task: cleanTask,
          answer: result,
          date: new Date().toISOString()
        },
        ...history
      ].slice(0, 20);

      saveHistory(nextHistory);
      setTask("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Naməlum xəta baş verdi.";

      setAnswer(`Xəta: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    saveHistory([]);
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="badge">LIM10 PERSONAL AGENT</div>

        <h1>Lim10, mənə kömək et</h1>

        <p className="subtitle">
          Yaz və ya danış. Lim10 cavab hazırlayacaq və
          onu səslə oxuyacaq.
        </p>

        <form onSubmit={submitTask}>
          <textarea
            value={task}
            onChange={(event) =>
              setTask(event.target.value)
            }
            placeholder="Məsələn: Bu gün etməli olduğum işləri planlaşdır..."
            rows={5}
            disabled={loading}
          />

          <div className="actions">
            <button
              type="button"
              className="voice"
              onClick={startVoice}
              disabled={loading}
            >
              {listening
                ? "⏹ Dinləməni dayandır"
                : "🎙 Danış"}
            </button>

            <button
              type="submit"
              disabled={loading || !task.trim()}
            >
              {loading ? "İşləyir..." : "Göndər"}
            </button>
          </div>
        </form>

        {speaking && (
          <button
            type="button"
            className="voice"
            onClick={stopSpeaking}
          >
            🔇 Səsi dayandır
          </button>
        )}

        {answer && (
          <div className="answer">
            <strong>Lim10 cavabı</strong>
            <p>{answer}</p>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="history">
          <div>
            <h2>Son tapşırıqlar</h2>

            <button
              type="button"
              onClick={clearHistory}
            >
              Tarixçəni sil
            </button>
          </div>

          {history.map((item, index) => (
            <article key={`${item.date}-${index}`}>
              <strong>{item.task}</strong>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
