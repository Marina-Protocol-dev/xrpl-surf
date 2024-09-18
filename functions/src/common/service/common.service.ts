import { PaginationData } from "../model/response.model";
import PFLogger from "../util/logger";

const DEFAULT_PER_PAGE = 12;
const PREDEFINED = ["next", "prev", "sort", "perPage"];

const CommonService = {
  async findAll(
    collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    logger: PFLogger,
    param: any
  ): Promise<PaginationData<any>> {
    const res = new PaginationData<any>();

    logger.setParams(param);

    try {
      res.result = true;

      let query = null;
      let countQuery = null;

      const keys = Object.keys(param) || [];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key) {
          continue;
        }

        if (PREDEFINED.includes(key.trim())) {
          continue;
        }

        const obj = param[key];

        if (obj !== undefined) {
          const { value, opStr } = obj;
          if (value !== undefined) {
            query = (query ? query : collection).where(key, opStr, value);
            countQuery = (countQuery ? countQuery : collection).where(
              key,
              opStr,
              value
            );
          }
        }
      }

      if (param.sort !== undefined) {
        const sortArr = param.sort.split(",");
        for (let i = 0; i < sortArr.length; i++) {
          const sortStr = sortArr[i];
          const arr = sortStr.split("__");
          if (arr.length === 2) {
            query = (query ? query : collection).orderBy(
              arr[0],
              arr[1] == "asc" ? "asc" : "desc"
            );
          }
        }
      } else {
        query = (query ? query : collection).orderBy("createdAt", "desc"); // "desc"
      }

      const size =
        param.perPage !== undefined
          ? parseInt(param.perPage)
          : DEFAULT_PER_PAGE;

      // 조회 수를 하나더 추가함.
      // 이전 다음 값이 존재하는지 사용함.
      const limit = size + 1;

      if (param.next !== undefined && !!param.next) {
        const nextCursorRef = await collection.doc(param.next).get();
        if (nextCursorRef && nextCursorRef.exists) {
          query = (query ? query : collection).startAt(nextCursorRef);
        }
        query = (query ? query : collection).limit(limit);
      } else if (param.prev !== undefined && !!param.prev) {
        const prevCursorRef = await collection.doc(param.prev).get();
        if (prevCursorRef && prevCursorRef.exists) {
          query = (query ? query : collection).endBefore(prevCursorRef);
        }
        query = (query ? query : collection).limitToLast(limit);
      } else {
        query = (query ? query : collection).limit(limit);
      }

      if (!query) {
        res.result = false;
        res.error = "";
        res.message = "";
        res.datas = undefined;
        return res;
      }

      res.datas = [];

      const snapshot = await query.get();
      if (snapshot.size == 0) {
        res.totalCount = 0;
        return res;
      }

      const docs = snapshot.docs;
      //
      if (docs.length == limit) {
        if (param.prev !== undefined && !!param.prev) {
          docs.splice(0, 1);
          res.prev = docs[0].id;
          res.next = param.prev;
        } else {
          const nextDoc = docs.splice(docs.length - 1, 1);
          res.next = nextDoc[0].id;
        }

        if (param.next !== undefined && !!param.next) {
          res.prev = docs[0].id;
        }
      } else {
        if (param.prev !== undefined) {
          res.next = param.prev;
        }

        if (param.next !== undefined && !!param.next) {
          res.prev = param.next;
        }
      }

      const snap = await (countQuery ? countQuery : collection).count().get();
      res.totalCount = snap.data().count;
      // res.totalCount = 0;

      docs.forEach((doc) => {
        if (doc && doc.exists) {
          const data = doc.data();
          data["id"] = doc.id;
          res.datas?.push(data);
        }
      });

      res.result = true;

      return res;
    } catch (err: any) {
      logger.error(err.toString());
      res.result = false;
      res.error = "PE500";
      res.message = "Internal Server Error";
      return res;
    }
  },

  async findAllWithoutTotalCount(
    collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    logger: PFLogger,
    param: any
  ): Promise<PaginationData<any>> {
    const res = new PaginationData<any>();

    logger.setParams(param);

    try {
      res.result = true;

      let query = null;

      const keys = Object.keys(param) || [];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key) {
          continue;
        }

        if (PREDEFINED.includes(key.trim())) {
          continue;
        }

        const obj = param[key];

        if (obj !== undefined) {
          const { value, opStr } = obj;
          if (value !== undefined) {
            query = (query ? query : collection).where(key, opStr, value);
          }
        }
      }

      if (param.sort !== undefined) {
        const sortArr = param.sort.split(",");
        for (let i = 0; i < sortArr.length; i++) {
          const sortStr = sortArr[i];
          const arr = sortStr.split("__");
          if (arr.length === 2) {
            query = (query ? query : collection).orderBy(
              arr[0],
              arr[1] == "asc" ? "asc" : "desc"
            );
          }
        }
      } else {
        query = (query ? query : collection).orderBy("createdAt", "desc"); // "desc"
      }

      const size =
        param.perPage !== undefined
          ? parseInt(param.perPage)
          : DEFAULT_PER_PAGE;

      // 조회 수를 하나더 추가함.
      // 이전 다음 값이 존재하는지 사용함.
      const limit = size + 1;

      if (param.next !== undefined && !!param.next) {
        const nextCursorRef = await collection.doc(param.next).get();
        if (nextCursorRef && nextCursorRef.exists) {
          query = (query ? query : collection).startAt(nextCursorRef);
        }
        query = (query ? query : collection).limit(limit);
      } else if (param.prev !== undefined && !!param.prev) {
        const prevCursorRef = await collection.doc(param.prev).get();
        if (prevCursorRef && prevCursorRef.exists) {
          query = (query ? query : collection).endBefore(prevCursorRef);
        }
        query = (query ? query : collection).limitToLast(limit);
      } else {
        query = (query ? query : collection).limit(limit);
      }

      if (!query) {
        res.result = false;
        res.error = "";
        res.message = "";
        res.datas = undefined;
        return res;
      }

      res.datas = [];

      const snapshot = await query.get();
      if (snapshot.size == 0) {
        res.totalCount = 0;
        return res;
      }

      const docs = snapshot.docs;
      //
      if (docs.length == limit) {
        if (param.prev !== undefined && !!param.prev) {
          docs.splice(0, 1);
          res.prev = docs[0].id;
          res.next = param.prev;
        } else {
          const nextDoc = docs.splice(docs.length - 1, 1);
          res.next = nextDoc[0].id;
        }

        if (param.next !== undefined && !!param.next) {
          res.prev = docs[0].id;
        }
      } else {
        if (param.prev !== undefined) {
          res.next = param.prev;
        }

        if (param.next !== undefined && !!param.next) {
          res.prev = param.next;
        }
      }

      res.totalCount = 0;

      docs.forEach((doc) => {
        if (doc && doc.exists) {
          const data = doc.data();
          data["id"] = doc.id;
          res.datas?.push(data);
        }
      });

      res.result = true;

      return res;
    } catch (err: any) {
      logger.error(err.toString());
      res.result = false;
      res.error = "PE500";
      res.message = "Internal Server Error";
      return res;
    }
  },
};

export default CommonService;
