// ULID-like ID generation
let counter = 0;
let lastTime = 0;

export function ulid(): string {
  const time = Date.now();
  if (time === lastTime) {
    counter++;
  } else {
    counter = 0;
    lastTime = time;
  }
  
  return time.toString(36) + counter.toString(36).padStart(3, '0') + Math.random().toString(36).slice(2, 10);
}