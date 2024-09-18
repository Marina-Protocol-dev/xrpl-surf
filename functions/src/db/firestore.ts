import admin from "firebase-admin";
// admin.firestore().settings({ ignoreUndefinedProperties: true });

import { FirebaeQueryParam } from "../common/types/common";
import { FieldValue, FieldPath } from "firebase-admin/firestore";
import { Filter } from "@google-cloud/firestore";

const _db = admin.firestore();

const FirestoreService = {
  db: _db,
  collection(
    table: string
  ): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    return _db.collection(table);
  },
  async findDocs(
    table: string,
    ids: string[],
    op: FirebaseFirestore.WhereFilterOp = "in"
  ) {
    try {
      return await this.collection(table)
        .where(admin.firestore.FieldPath.documentId(), op, ids)
        .get();
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },
  async findAll(tableName: string, options?: FirebaeQueryParam) {
    try {
      if (options !== undefined) {
        const _table = this.collection(tableName);

        let query = null;
        if (options.limit !== undefined) {
          query = _table.limit(options.limit);
        }

        if (options.orderBy != undefined) {
          const orderArr = options.orderBy.split(",");
          const field = orderArr[0];
          const direct: "asc" | "desc" =
            orderArr.length == 2
              ? orderArr[1] === "desc"
                ? "desc"
                : "asc"
              : "asc";

          query = query
            ? query.orderBy(field, direct)
            : _table.orderBy(field, direct);
        }

        if (options.next != undefined) {
          const cursor = await _table.doc(options.next).get();
          query = query ? query.startAfter(cursor) : _table.startAfter(cursor);
        }

        if (!query) {
          query = _table;
        }

        return await query.get();
      } else {
        return await this.collection(tableName).get();
      }
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },
  async findOne(
    table: string,
    id: string
  ): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null> {
    try {
      return await this.collection(table).doc(id).get();
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },
  async set(
    table: string,
    docId: string,
    data: any
  ): Promise<FirebaseFirestore.WriteResult | null> {
    try {
      const ref = await _db
        .collection(table)
        .doc(docId)
        .set({
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          ...data,
        });
      return ref;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },
  async create(
    table: string,
    data: any
    // eslint-disable-next-line max-len
  ): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null> {
    try {
      const ref = await _db.collection(table).add({
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        ...data,
      });
      return ref;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },
  async update(table: string, id: string, data: any): Promise<boolean> {
    try {
      const doc = await _db.collection(table).doc(id).get();
      if (!doc || !doc.exists) {
        return false;
      }

      const res = await doc.ref.update({
        updatedAt: FieldValue.serverTimestamp(),
        ...data,
      });

      return !!res;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },

  async delete(table: string, id: string): Promise<boolean> {
    try {
      const doc = await this.collection(table).doc(id).get();
      if (!doc || !doc.exists) {
        return true;
      }

      const res = await doc.ref.delete();

      return !!res;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },

  async deleteRef(table: string, id: string): Promise<any> {
    try {
      const doc = await this.collection(table).doc(id).get();
      if (!doc || !doc.exists) {
        return true;
      }

      const data = doc.data();

      const res = await doc.ref.delete();
      return res ? data : null;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },

  async deleteAll(table: string): Promise<boolean> {
    try {
      const snapshot = await this.collection(table).get();
      if (!snapshot || snapshot.size == 0) {
        return false;
      }

      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        await doc.ref.delete();
      }
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },
  serverTimestamp() {
    return FieldValue.serverTimestamp();
  },
  increment(num = 1) {
    return FieldValue.increment(num);
  },
};

export default FirestoreService;

export const FirestoreFieldValue = FieldValue;
export const FirestoreFieldPath = FieldPath;

export const FirestoreFilter = Filter;
