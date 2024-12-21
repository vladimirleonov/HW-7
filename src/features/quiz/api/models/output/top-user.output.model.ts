export class TopUserOutputModel {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: Player;
}

class Player {
  id: string;
  login: string;
}
