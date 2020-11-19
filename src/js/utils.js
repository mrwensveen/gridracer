export function allPlayersReady(players) {
  return !players.some((p) => p && !p.ready);
}

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export function randomGameName(length = 7) {
  let name = '';
  for (let i = 0; i < length; i++) {
    name += alphabet[(Math.floor(Math.random() * alphabet.length))];
  }

  return name;
}

export function mod(x, m) {
  return ((x % m) + m) % m;
}

export function int(x) {
	// bitwise OR with 0 to get the int part
	return x | 0;
}

export function between(value, a, b) {
	const min = Math.min(a, b);
	const max = Math.max(a, b);
  return value >= min && value <= max;
}
