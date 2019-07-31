export default class File {

  // TODO: make contents able to be a buffer or some sort of byte array
  public constructor(
    public readonly path: string,
    public readonly contents: string
  ) {

  }
}