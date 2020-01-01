import DataObject from '../objects/DataObject';

class DBNode {
  public readonly children: { [S in string]?: DBNode } = {};

  public constructor(
    public parent: DBNode | undefined,
    public name: string,
    public item?: DataObject
  ) {}

  public getPath(): string {
    return this.parent
      ? this.parent.getPath() + '/' + this.name
      : this.name;
  }

  public serialize(): DBNode.SerializedData {
    const data: DBNode.SerializedData = {};

    if (this.item) data.item = this.item.serialize();

    for (const key in this.children) {
      if (!data.children) data.children = {};
      data.children[key] = this.children[key]?.serialize();
    }

    return data;
  }
}

namespace DBNode {
  export type SerializedData = {
    item?: DataObject.SerializedData | null;
    children?: { [S in string]?: SerializedData };
  }
}

export default DBNode;