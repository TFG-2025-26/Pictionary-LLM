import { useParams } from "react-router-dom";
import "./GamePage.css";

type GameParams = {
  roomId: string;
};

export default function GamePage() {
  const { roomId } = useParams<GameParams>();

  return (
    <section className="game-page">
      <h1>Partida en Sala {roomId}</h1>
      <div className="canvas-placeholder">
        Canvas sincronizado (esqueleto). Aqui se integrara el componente de dibujo compartido.
      </div>
    </section>
  );
}
