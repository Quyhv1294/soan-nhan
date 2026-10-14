// Gọi POST /api/generate từ trình duyệt, trả về nội dung hoặc ném Error với câu tiếng Việt cho người dùng.
export async function goiSoan<T>(loai: string, input: Record<string, string | undefined>): Promise<T> {
  let res: Response;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loai, input }),
    });
  } catch {
    throw new Error("Mất kết nối mạng. Cô kiểm tra mạng rồi thử lại.");
  }
  const json = (await res.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!res.ok || json?.data == null) throw new Error(json?.error ?? "Không soạn được lúc này. Cô thử lại sau ít phút nhé.");
  return json.data;
}
