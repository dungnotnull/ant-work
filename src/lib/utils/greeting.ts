interface Greeting {
  japanese: string;
  english: string;
}

export function getGreeting(): Greeting {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { japanese: "おはようございます", english: "Good morning" };
  }
  if (hour >= 12 && hour < 18) {
    return { japanese: "こんにちは", english: "Good afternoon" };
  }
  if (hour >= 18 && hour < 21) {
    return { japanese: "こんばんは", english: "Good evening" };
  }
  return { japanese: "おやすみなさい", english: "Good night" };
}
