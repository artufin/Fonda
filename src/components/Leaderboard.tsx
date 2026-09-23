import type { LeaderboardEntry } from "@/lib/leaderboard";

const MEDALLAS = ["🥇", "🥈", "🥉"];

type Props = {
  titulo: string;
  entries: LeaderboardEntry[];
  vacioTexto: string;
};

export function Leaderboard({ titulo, entries, vacioTexto }: Props) {
  return (
    <div className="ranking-grupo">
      <h2>{titulo}</h2>
      {entries.length === 0 ? (
        <p className="ranking-vacio">{vacioTexto}</p>
      ) : (
        <ol className="ranking">
          {entries.map((e, i) => (
            <li key={e.id}>
              <span className="medalla">{MEDALLAS[i]}</span>
              {e.name}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
