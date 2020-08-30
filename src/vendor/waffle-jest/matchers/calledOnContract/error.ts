export class ProviderWithHistoryExpected extends Error {
  public constructor() {
    super('calledOnContract matcher requires provider that support call history');
  }
}
