// Minimal BPJS client placeholder — simulate external integration
export async function submitClaimToBPJS(tagihanId: number) {
  // Simulate network call / external API — in real implementation call BPJS API here
  // Return simulated result object
  await new Promise((r) => setTimeout(r, 300))
  // Randomly approve for demo purposes (replace with real logic)
  const approved = Math.random() > 0.3
  return { success: true, approved }
}

export async function checkClaimStatusFromBPJS(klaimId: number) {
  // Placeholder: return random status
  const statuses = ['DISETUJUI', 'DITOLAK', 'MENUNGGU']
  return { status: statuses[Math.floor(Math.random() * statuses.length)] }
}