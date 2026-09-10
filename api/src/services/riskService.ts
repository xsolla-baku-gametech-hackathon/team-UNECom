import { engineClient } from "../clients/engineClient.js";
import { eventRepository } from "../repositories/eventRepository.js";

export const riskService = {
  // Returns the engine's AccountResult for this account, or null if the
  // account has no events / wasn't part of the analyzed graph.
  async getAccountRisk(accountId: string) {
    const events = await eventRepository.findAllAsContract();
    if (events.length === 0) return null;
    const analysis = await engineClient.analyze(events);
    return analysis.accounts.find((a) => a.account_id === accountId) ?? null;
  },
};
