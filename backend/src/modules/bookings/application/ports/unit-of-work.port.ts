export abstract class UnitOfWorkPort {
  abstract transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
