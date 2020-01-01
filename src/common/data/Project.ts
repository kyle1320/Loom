import DataExtension from '../extensions/DataExtension';
import ObjectDB from './db/ObjectDB';

export class SerializationError extends Error {}

class Project {
  public readonly db: ObjectDB = new ObjectDB();
  private extensions: DataExtension[] = [];

  public addExtension(ext: DataExtension): void {
    this.extensions.push(ext);
    ext.initProject?.(this);
  }

  public serialize(): Project.SerializedData {
    return {
      serializationVersion: Project.serializationVersion,
      db: this.db.serialize()
    };
  }

  public static deserialize(
    data: Project.SerializedData,
    extensions: DataExtension[]
  ): Project {
    // TODO: handle differing serialization versions
    if (data.serializationVersion !== Project.serializationVersion) {
      throw new SerializationError();
    }

    const proj = new Project();

    // TODO: load extenions dynamically from serialized data
    extensions.forEach(ex => proj.addExtension(ex));

    ObjectDB.deserialize(data.db, proj.db);

    return proj;
  }
}

namespace Project {
  export const serializationVersion = 1;

  export interface SerializedData {
    serializationVersion: number;
    db: ObjectDB.SerializedData;
  }
}

export default Project;