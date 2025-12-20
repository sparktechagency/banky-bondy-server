/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { isTextSafe } from '../../helper/isTextSafe';
import { generateEmbedding } from '../../utilities/embedding';
import NormalUser from '../normalUser/normalUser.model';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';
import { IBondRequest } from './bondRequest.interface';
import BondRequest from './bondRequest.model';

const createBondRequestIntoDB = async (
    userId: string,
    payload: IBondRequest
) => {
    const [user, currentBondCount] = await Promise.all([
        NormalUser.findById(userId),
        BondRequest.countDocuments({ user: userId }),
    ]);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (currentBondCount >= user.bondLimit) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            'Bond request limit reached. Please upgrade your subscription.'
        );
    }

    const offerCheck = await isTextSafe(payload.offer);

    if (!offerCheck.safe)
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Offer is not allowed: ${offerCheck.reason}`
        );
    const wantCheck = await isTextSafe(payload.want);

    if (!wantCheck.safe)
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Want is not allowed: ${wantCheck.reason}`
        );
    const [offerVector, wantVector] = await Promise.all([
        generateEmbedding(payload.offer),
        generateEmbedding(payload.want),
    ]);

    return await BondRequest.create({
        ...payload,
        offerVector,
        wantVector,
        user: userId,
    });
};

const getLastBond = async (userId: string) => {
    return await BondRequest.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select('offer want location');
};

const getAllBondRequests = async (query: Record<string, unknown>) => {
    const resultQuery = new QueryBuilder(BondRequest.find(), query)
        .search(['give', 'get', 'location'])
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await resultQuery.modelQuery;
    const meta = await resultQuery.countTotal();

    return {
        meta,
        result,
    };
};
// get my bond request
const myBondRequests = async (
    userId: string,
    query: Record<string, unknown>
) => {
    const resultQuery = new QueryBuilder(
        BondRequest.find({ user: userId, isLinked: false }).select(
            '-offerVector -wantVector'
        ),
        query
    )
        .search(['offer', 'want', 'location'])
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await resultQuery.modelQuery;
    const meta = await resultQuery.countTotal();

    return {
        meta,
        result,
    };
};

const getSingleBondRequest = async (id: string) => {
    const bondRequest = await BondRequest.findById(id);
    if (!bondRequest)
        throw new AppError(httpStatus.NOT_FOUND, 'BondRequest not found');
    return bondRequest;
};

const updateBondRequestIntoDB = async (
    userId: string,
    id: string,
    payload: Partial<IBondRequest>
) => {
    const bondRequest = await BondRequest.findOne({ _id: id, user: userId });
    if (!bondRequest)
        throw new AppError(httpStatus.NOT_FOUND, 'BondRequest not found');

    if (payload.offer) {
        const offerCheck = await isTextSafe(payload.offer);

        if (!offerCheck.safe)
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Offer is not allowed: ${offerCheck.reason}`
            );
    }
    if (payload.want) {
        const wantCheck = await isTextSafe(payload.want);

        if (!wantCheck.safe)
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Want is not allowed: ${wantCheck.reason}`
            );
    }

    if (payload.offer && payload.want) {
        const [offerVector, wantVector] = await Promise.all([
            generateEmbedding(payload.offer),
            generateEmbedding(payload.want),
        ]);

        return await BondRequest.findByIdAndUpdate(
            id,
            { ...payload, offerVector, wantVector },
            { new: true }
        );
    } else if (payload.offer) {
        const offerVector = await generateEmbedding(payload.offer);
        return await BondRequest.findByIdAndUpdate(
            id,
            { ...payload, offerVector },
            { new: true }
        );
    } else if (payload.want) {
        const wantVector = await generateEmbedding(payload.want);
        return await BondRequest.findByIdAndUpdate(
            id,
            { ...payload, wantVector },
            { new: true }
        );
    } else {
        return await BondRequest.findByIdAndUpdate(id, payload, { new: true });
    }
};

const deleteBondRequestFromDB = async (userId: string, id: string) => {
    const bondRequest = await BondRequest.findOne({ user: userId, _id: id });
    if (!bondRequest)
        throw new AppError(httpStatus.NOT_FOUND, 'BondRequest not found');

    return await BondRequest.findByIdAndDelete(id);
};

// another try ------------------------------
// export const cosineSimilarity = (a: number[], b: number[]): number => {
//     if (!Array.isArray(a) || !Array.isArray(b)) return 0;
//     const minLen = Math.min(a.length, b.length);
//     let dot = 0,
//         magA = 0,
//         magB = 0;
//     for (let i = 0; i < minLen; i++) {
//         dot += a[i] * b[i];
//         magA += a[i] * a[i];
//         magB += b[i] * b[i];
//     }
//     magA = Math.sqrt(magA);
//     magB = Math.sqrt(magB);
//     if (!magA || !magB) return 0;
//     return dot / (magA * magB);
// };

// export const normalizeText = (s?: string) =>
//     (s || '')
//         .toLowerCase()
//         .replace(/[^\w\s]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();

// export const tokenOverlapRatio = (a?: string, b?: string): number => {
//     const A = normalizeText(a).split(' ').filter(Boolean);
//     const B = normalizeText(b).split(' ').filter(Boolean);
//     if (!A.length || !B.length) return 0;
//     const setB = new Set(B);
//     const overlap = A.filter((t) => setB.has(t)).length;
//     return overlap / Math.min(A.length, B.length);
// };

// export const calculateMatchScore = (
//     wantVec: number[] = [],
//     offerVec: number[] = [],
//     wantText: string = '',
//     offerText: string = ''
// ): number => {
//     const sim = cosineSimilarity(wantVec, offerVec);
//     const overlap = tokenOverlapRatio(wantText, offerText);
//     return 0.7 * sim + 0.3 * overlap;
// };

// const calculateMatchScoreWithPriority = (
//     want: string,
//     wantVec: number[],
//     offer: string,
//     offerVec: number[]
// ): number => {
//     const normalizedWant = normalizeText(want);
//     const normalizedOffer = normalizeText(offer);

//     const isWantSurprise = normalizedWant === 'surprise';
//     const isWantEmpty = normalizedWant === 'empty';
//     const isOfferSurprise = normalizedOffer === 'surprise';
//     const isOfferEmpty = normalizedOffer === 'empty';

//     let baseScore = calculateMatchScore(wantVec, offerVec, want, offer);

//     // Apply priority bonus based on both want & offer
//     if (!isWantEmpty && !isWantSurprise)
//         baseScore += 0.2; // Normal entry highest
//     else if (isWantEmpty) baseScore += 0.1; // Empty next
//     else if (isWantSurprise) baseScore += 0.05; // Surprise lowest

//     if (!isOfferEmpty && !isOfferSurprise) baseScore += 0.1;
//     else if (isOfferEmpty) baseScore += 0.05;
//     else if (isOfferSurprise) baseScore += 0.02;

//     return Math.min(baseScore, 1); // Ensure max score = 1
// };

// export const isHighConfidenceMatch = (score: number) => score >= 0.7;

// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     if (!checkRateLimit(userId)) {
//         throw new AppError(
//             httpStatus.TOO_MANY_REQUESTS,
//             'Too many bond requests. Please wait a while before trying again.'
//         );
//     }
//     //--------------------
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const MIN_SCORE = 0.4;
//     const MAX_CYCLE_SIZE = 5;

//     const isEmpty = (s?: string) => normalizeText(s) === 'empty';
//     const isSurprise = (s?: string) => normalizeText(s) === 'surprise';

//     // --- Matching rules ---
//     const isValidMatch = (want: string, offer: string): boolean => {
//         const wantSurprise = isSurprise(want);
//         const offerSurprise = isSurprise(offer);
//         if (wantSurprise) return true; // Want surprise → accept anything
//         if (offerSurprise) return wantSurprise; // Offer surprise → only matches if want surprise
//         return tokenOverlapRatio(want, offer) > 0; // Specific wants → must match
//     };

//     // 1. Fetch starting bond request
//     const startRequest = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//     })
//         .select('offer want offerVector wantVector location radius')
//         .lean();

//     if (!startRequest) throw new AppError(404, 'Bond request not found');

//     // 2. Ensure embeddings exist for start request
//     if (!startRequest.offerVector?.length) {
//         startRequest.offerVector = await generateEmbedding(startRequest.offer);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { offerVector: startRequest.offerVector }
//         );
//     }
//     if (!startRequest.wantVector?.length) {
//         startRequest.wantVector = await generateEmbedding(startRequest.want);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { wantVector: startRequest.wantVector }
//         );
//     }

//     // 3. Geo filter
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 4. Fetch candidates
//     const candidates = await BondRequest.find({
//         _id: { $ne: bondRequestId },
//         user: { $ne: userId },
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//         ...geoFilter,
//     })
//         .select('_id user offer want offerVector wantVector location radius')
//         .lean();

//     const matches: { ids: string[]; score: number }[] = [];
//     const globalSeen = new Set<string>();

//     // 5. Ensure embeddings for candidates (once)
//     for (const candidate of candidates) {
//         if (!candidate.offerVector?.length) {
//             candidate.offerVector = await generateEmbedding(
//                 candidate.offer || ''
//             );
//         }
//         if (!candidate.wantVector?.length) {
//             candidate.wantVector = await generateEmbedding(
//                 candidate.want || ''
//             );
//         }
//     }

//     // 6. Pairwise matches (2-user chains)
//     for (const candidate of candidates) {
//         const startOfferEmpty = isEmpty(startRequest.offer);
//         const startWantEmpty = isEmpty(startRequest.want);
//         const candidateOfferEmpty = isEmpty(candidate.offer);
//         const candidateWantEmpty = isEmpty(candidate.want);

//         if (
//             (startOfferEmpty && !candidateWantEmpty) ||
//             (startWantEmpty && !candidateOfferEmpty)
//         )
//             continue;

//         if (!isValidMatch(startRequest.want, candidate.offer)) continue;
//         if (!isValidMatch(candidate.want, startRequest.offer)) continue;

//         const score1 = calculateMatchScoreWithPriority(
//             startRequest.want,
//             startRequest.wantVector || [],
//             candidate.offer,
//             candidate.offerVector || []
//         );
//         const score2 = calculateMatchScoreWithPriority(
//             candidate.want,
//             candidate.wantVector || [],
//             startRequest.offer,
//             startRequest.offerVector || []
//         );

//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             const avgScore = (score1 + score2) / 2;
//             const pairKey = [bondRequestId, candidate._id.toString()]
//                 .sort()
//                 .join('-');
//             if (!globalSeen.has(pairKey)) {
//                 globalSeen.add(pairKey);
//                 matches.push({
//                     ids: [bondRequestId, candidate._id.toString()],
//                     score: avgScore,
//                 });
//             }
//         }
//     }

//     // 7. Build edges for cycles
//     const requestMap = new Map<string, any>(
//         candidates.map((c) => [c._id.toString(), c])
//     );
//     requestMap.set(bondRequestId, startRequest);

//     const edges: Map<string, { to: string; score: number }[]> = new Map();
//     for (const [id, req] of requestMap.entries()) {
//         if (!req.offerVector?.length)
//             req.offerVector = await generateEmbedding(req.offer || '');
//         if (!req.wantVector?.length)
//             req.wantVector = await generateEmbedding(req.want || '');

//         edges.set(id, []);
//         for (const [toId, toReq] of requestMap.entries()) {
//             if (id === toId) continue;
//             if (!isValidMatch(req.want, toReq.offer)) continue;
//             if (!isValidMatch(toReq.want, req.offer)) continue;

//             const score = calculateMatchScoreWithPriority(
//                 req.want,
//                 req.wantVector || [],
//                 toReq.offer,
//                 toReq.offerVector || []
//             );

//             if (score >= MIN_SCORE) edges.get(id)!.push({ to: toId, score });
//         }
//     }

//     // 8. DFS to find cycles (3-5 user chains)
//     const dfs = (
//         startId: string,
//         currentId: string,
//         path: string[],
//         accScore: number
//     ) => {
//         if (path.length > MAX_CYCLE_SIZE) return;

//         const usersInPath = new Set(
//             path.map(
//                 (id) =>
//                     requestMap.get(id)?.user?.toString() ||
//                     requestMap.get(id)?.user?._id?.toString()
//             )
//         );

//         for (const { to, score: nextScore } of edges.get(currentId) || []) {
//             if (path.includes(to)) {
//                 if (to === startId && path.length >= 3) {
//                     // --- FIXED: canonical key to avoid duplicates ---
//                     const cycle = [...path];
//                     const sortedCycle = [...cycle].sort();
//                     const cycleKey = sortedCycle.join('->');

//                     if (!globalSeen.has(cycleKey)) {
//                         globalSeen.add(cycleKey);
//                         matches.push({ ids: [...path], score: accScore });
//                     }
//                 }
//                 continue;
//             }

//             const toRequest = requestMap.get(to);
//             const toUserId =
//                 toRequest?.user?.toString() || toRequest?.user?._id?.toString();
//             if (usersInPath.has(toUserId)) continue;

//             const newScore = (accScore + nextScore) / 2;
//             dfs(startId, to, [...path, to], newScore);
//         }
//     };

//     dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

//     // 9. Populate final results
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     const sorted = matches.sort((a, b) => {
//         const lengthA = a.ids.length;
//         const lengthB = b.ids.length;

//         // Prefer shorter chains first
//         if (lengthA !== lengthB) {
//             return lengthA - lengthB; // smaller length comes first
//         }

//         // If same length, sort by score descending
//         return b.score - a.score;
//     });

//     const total = sorted.length;
//     const MAX_RESULTS = 100;
//     const effectiveLimit = Math.min(limit, MAX_RESULTS);

//     const startIndex = (page - 1) * effectiveLimit;
//     const paginated = sorted.slice(startIndex, startIndex + effectiveLimit);

//     const result = paginated.map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//     }));

//     return {
//         total,
//         page,
//         limit,
//         data: result,
//     };
// };

// const cosineSimilarity = (a: number[], b: number[]): number => {
//     if (!Array.isArray(a) || !Array.isArray(b)) return 0;
//     const len = Math.min(a.length, b.length);
//     let dot = 0,
//         magA = 0,
//         magB = 0;
//     for (let i = 0; i < len; i++) {
//         dot += a[i] * b[i];
//         magA += a[i] ** 2;
//         magB += b[i] ** 2;
//     }
//     const denom = Math.sqrt(magA) * Math.sqrt(magB);
//     return denom === 0 ? 0 : dot / denom;
// };

// const normalizeText = (text?: string) =>
//     (text || '')
//         .toLowerCase()
//         .replace(/[^\w\s]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();

// const tokenOverlapRatio = (a?: string, b?: string): number => {
//     const A = normalizeText(a).split(' ').filter(Boolean);
//     const B = normalizeText(b).split(' ').filter(Boolean);
//     if (!A.length || !B.length) return 0;
//     const setB = new Set(B);
//     const overlap = A.filter((t) => setB.has(t)).length;
//     return overlap / Math.min(A.length, B.length);
// };

// const calculateMatchScore = (
//     wantVec: number[] = [],
//     offerVec: number[] = [],
//     wantText: string = '',
//     offerText: string = ''
// ): number => {
//     const sim = cosineSimilarity(wantVec, offerVec);
//     const overlap = tokenOverlapRatio(wantText, offerText);
//     return 0.7 * sim + 0.3 * overlap;
// };

// // ----------------- Main Function -----------------
// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const MIN_SCORE = 0.4;
//     const MAX_CYCLE_SIZE = 5;

//     const isEmpty = (t?: string) => normalizeText(t) === 'empty';
//     const isSurprise = (t?: string) => normalizeText(t) === 'surprise';

//     // Helper: wildcard surprise
//     const getMatchScoreWithSurprise = (
//         wantVec: number[],
//         offerVec: number[],
//         wantText: string,
//         offerText: string
//     ) => {
//         if (isSurprise(wantText) || isSurprise(offerText)) return 1;
//         return calculateMatchScore(wantVec, offerVec, wantText, offerText);
//     };

//     // 1️⃣ Fetch base bond request
//     const start = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//     })
//         .select('offer want offerVector wantVector location radius user')
//         .lean();

//     if (!start) throw new AppError(404, 'Bond request not found');

//     // 2️⃣ Ensure embeddings
//     if (!start.offerVector?.length) {
//         start.offerVector = await generateEmbedding(start.offer);
//         await BondRequest.updateOne(
//             { _id: start._id },
//             { offerVector: start.offerVector }
//         );
//     }
//     if (!start.wantVector?.length) {
//         start.wantVector = await generateEmbedding(start.want);
//         await BondRequest.updateOne(
//             { _id: start._id },
//             { wantVector: start.wantVector }
//         );
//     }

//     // 3️⃣ Geo filter
//     const geoFilter: any = {};
//     if (start.location && start.radius) {
//         const [lng, lat] = start.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: { $centerSphere: [[lng, lat], start.radius / 6371] },
//         };
//     }

//     // 4️⃣ Fetch candidates
//     const candidates = await BondRequest.find({
//         _id: { $ne: bondRequestId },
//         user: { $ne: userId },
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//         ...geoFilter,
//     })
//         .select('_id user offer want offerVector wantVector location radius')
//         .lean();

//     // 5️⃣ Ensure embeddings for all
//     for (const c of candidates) {
//         if (!c.offerVector?.length)
//             c.offerVector = await generateEmbedding(c.offer || '');
//         if (!c.wantVector?.length)
//             c.wantVector = await generateEmbedding(c.want || '');
//     }

//     const matches: { ids: string[]; score: number }[] = [];
//     const globalSeen = new Set<string>();

//     // 6️⃣ 2-person direct matches
//     for (const c of candidates) {
//         if (c.user.toString() === start.user.toString()) continue;

//         // skip empty mismatch
//         if (
//             (isEmpty(start.offer) && !isEmpty(c.want)) ||
//             (isEmpty(start.want) && !isEmpty(c.offer))
//         )
//             continue;

//         // score using surprise wildcard
//         const score1 = getMatchScoreWithSurprise(
//             start.wantVector,
//             c.offerVector,
//             start.want,
//             c.offer
//         );
//         const score2 = getMatchScoreWithSurprise(
//             c.wantVector,
//             start.offerVector,
//             c.want,
//             start.offer
//         );

//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             const avg = Math.min(1, (score1 + score2) / 2);
//             const key = [bondRequestId, c._id.toString()].sort().join('-');
//             if (!globalSeen.has(key)) {
//                 globalSeen.add(key);
//                 matches.push({
//                     ids: [bondRequestId, c._id.toString()],
//                     score: avg,
//                 });
//             }
//         }
//     }

//     // 7️⃣ Build adjacency for cycles
//     const allReqs = [start, ...candidates];
//     const requestMap = new Map(allReqs.map((r) => [r._id.toString(), r]));
//     const edges = new Map<string, { to: string; score: number }[]>();

//     for (const [id, req] of requestMap) {
//         edges.set(id, []);
//         for (const [tid, tReq] of requestMap) {
//             if (id === tid) continue;
//             if (req.user.toString() === tReq.user.toString()) continue;
//             if (isEmpty(req.offer) && !isEmpty(tReq.want)) continue;
//             if (isEmpty(req.want) && !isEmpty(tReq.offer)) continue;

//             const score = getMatchScoreWithSurprise(
//                 req.wantVector,
//                 tReq.offerVector,
//                 req.want,
//                 tReq.offer
//             );
//             if (score >= MIN_SCORE) edges.get(id)!.push({ to: tid, score });
//         }
//     }

//     // 8️⃣ DFS for cycles (unique users only)
//     const seenCycles = new Set<string>();
//     const dfs = (
//         startId: string,
//         currId: string,
//         path: string[],
//         accScore: number,
//         userSet: Set<string>
//     ) => {
//         if (path.length > MAX_CYCLE_SIZE) return;

//         for (const { to, score } of edges.get(currId) || []) {
//             const nextReq = requestMap.get(to);
//             if (!nextReq) continue;

//             const nextUser = nextReq.user.toString();
//             if (userSet.has(nextUser)) continue; // user already used

//             if (path.includes(to)) {
//                 if (to === startId && path.length >= 3) {
//                     const key = path.sort().join('-');
//                     if (!seenCycles.has(key) && !globalSeen.has(key)) {
//                         seenCycles.add(key);
//                         globalSeen.add(key);
//                         matches.push({ ids: [...path], score: accScore });
//                     }
//                 }
//                 continue;
//             }

//             const newUserSet = new Set(userSet);
//             newUserSet.add(nextUser);
//             const newScore = (accScore + score) / 2;
//             dfs(startId, to, [...path, to], newScore, newUserSet);
//         }
//     };

//     dfs(
//         bondRequestId,
//         bondRequestId,
//         [bondRequestId],
//         1,
//         new Set([start.user.toString()])
//     );

//     // 9️⃣ Populate
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate('user', 'name profile_image')
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     // 🔟 Prepare final result
//     const sorted = matches.sort((a, b) => b.score - a.score);
//     const total = sorted.length;
//     const startIndex = (page - 1) * limit;
//     const paginated = sorted.slice(startIndex, startIndex + limit);

//     const data = paginated.map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//     }));

//     return { total, page, limit, data };
// };

/// last try man ------------------------------

export const cosineSimilarity = (a: number[], b: number[]): number => {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    const minLen = Math.min(a.length, b.length);
    let dot = 0,
        magA = 0,
        magB = 0;
    for (let i = 0; i < minLen; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (!magA || !magB) return 0;
    return dot / (magA * magB);
};

export const normalizeText = (s?: string) =>
    (s || '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export const tokenOverlapRatio = (a?: string, b?: string): number => {
    const A = normalizeText(a).split(' ').filter(Boolean);
    const B = normalizeText(b).split(' ').filter(Boolean);
    if (!A.length || !B.length) return 0;
    const setB = new Set(B);
    const overlap = A.filter((t) => setB.has(t)).length;
    return overlap / Math.min(A.length, B.length);
};

export const calculateMatchScore = (
    wantVec: number[] = [],
    offerVec: number[] = [],
    wantText: string = '',
    offerText: string = ''
): number => {
    const sim = cosineSimilarity(wantVec, offerVec);
    const overlap = tokenOverlapRatio(wantText, offerText);
    return 0.7 * sim + 0.3 * overlap;
};

// --- Helper for "surprise" scoring ---
const calculateMatchScoreWithSurprise = (
    want: string,
    wantVec: number[],
    offer: string,
    offerVec: number[]
): number => {
    const isSurprise = (s?: string) => normalizeText(s) === 'surprise';
    if (isSurprise(want)) {
        // Want = surprise → accept anything, give minimum high score
        return 0.8 + 0.2 * calculateMatchScore(wantVec, offerVec, want, offer);
    }
    return calculateMatchScore(wantVec, offerVec, want, offer);
};

export const isHighConfidenceMatch = (score: number) => score >= 0.7;

export const getMatchingBondRequest = async (
    userId: string,
    bondRequestId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const minScore = 0.4;
    const maxCycleSize = 5;
    const MIN_SCORE = Number(minScore);

    const isEmpty = (s?: string) => normalizeText(s) === 'empty';
    const isSurprise = (s?: string) => normalizeText(s) === 'surprise';

    // --- Matching rules ---
    const isValidMatch = (want: string, offer: string): boolean => {
        const wantSurprise = isSurprise(want);
        const offerSurprise = isSurprise(offer);
        if (wantSurprise) return true; // Want surprise → accept anything
        if (offerSurprise) return wantSurprise; // Offer surprise → only matches if want surprise
        return tokenOverlapRatio(want, offer) > 0; // Specific wants → must match
    };

    // 1. Fetch starting bond request
    const startRequest = await BondRequest.findOne({
        _id: bondRequestId,
        user: userId,
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
    })
        .select('offer want offerVector wantVector location radius')
        .lean();

    if (!startRequest) throw new AppError(404, 'Bond request not found');

    // 2. Ensure embeddings exist
    if (!startRequest.offerVector || !startRequest.offerVector.length) {
        startRequest.offerVector = await generateEmbedding(startRequest.offer);
        await BondRequest.updateOne(
            { _id: startRequest._id },
            { offerVector: startRequest.offerVector }
        );
    }
    if (!startRequest.wantVector || !startRequest.wantVector.length) {
        startRequest.wantVector = await generateEmbedding(startRequest.want);
        await BondRequest.updateOne(
            { _id: startRequest._id },
            { wantVector: startRequest.wantVector }
        );
    }

    // 3. Geo filter
    const geoFilter: any = {};
    if (startRequest.location && startRequest.radius) {
        const [lng, lat] = startRequest.location.coordinates;
        geoFilter.location = {
            $geoWithin: {
                $centerSphere: [[lng, lat], startRequest.radius / 6371],
            },
        };
    }

    // 4. Fetch candidates
    const candidates = await BondRequest.find({
        _id: { $ne: bondRequestId },
        user: { $ne: userId },
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
        ...geoFilter,
    })
        .select('_id user offer want offerVector wantVector location radius')
        .lean();

    const matches: { ids: string[]; score: number }[] = [];
    const globalSeen = new Set<string>();

    // 5. Ensure embeddings for candidates
    for (const candidate of candidates) {
        if (!candidate.offerVector || !candidate.offerVector.length) {
            candidate.offerVector = await generateEmbedding(
                candidate.offer || ''
            );
        }
        if (!candidate.wantVector || !candidate.wantVector.length) {
            candidate.wantVector = await generateEmbedding(
                candidate.want || ''
            );
        }
    }

    // 6. Pairwise matches
    for (const candidate of candidates) {
        const startOfferEmpty = isEmpty(startRequest.offer);
        const startWantEmpty = isEmpty(startRequest.want);
        const candidateOfferEmpty = isEmpty(candidate.offer);
        const candidateWantEmpty = isEmpty(candidate.want);

        if (
            (startOfferEmpty && !candidateWantEmpty) ||
            (startWantEmpty && !candidateOfferEmpty)
        ) {
            continue;
        }

        if (!isValidMatch(startRequest.want, candidate.offer)) continue;
        if (!isValidMatch(candidate.want, startRequest.offer)) continue;

        const score1 = calculateMatchScoreWithSurprise(
            startRequest.want,
            startRequest.wantVector || [],
            candidate.offer,
            candidate.offerVector || []
        );
        const score2 = calculateMatchScoreWithSurprise(
            candidate.want,
            candidate.wantVector || [],
            startRequest.offer,
            startRequest.offerVector || []
        );

        if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
            const avgScore = (score1 + score2) / 2;
            const pairKey = [bondRequestId, candidate._id.toString()]
                .sort()
                .join('-');
            if (!globalSeen.has(pairKey)) {
                globalSeen.add(pairKey);
                matches.push({
                    ids: [bondRequestId, candidate._id.toString()],
                    score: avgScore,
                });
            }
        }
    }

    // 7. Build edges for cycles
    const requestMap = new Map<string, any>(
        candidates.map((c) => [c._id.toString(), c])
    );
    requestMap.set(bondRequestId, startRequest);

    const edges: Map<string, { to: string; score: number }[]> = new Map();
    for (const [id, req] of requestMap.entries()) {
        if (!req.offerVector || !req.offerVector.length) {
            req.offerVector = await generateEmbedding(req.offer || '');
        }
        if (!req.wantVector || !req.wantVector.length) {
            req.wantVector = await generateEmbedding(req.want || '');
        }

        edges.set(id, []);
        for (const [toId, toReq] of requestMap.entries()) {
            if (id === toId) continue;
            if (!isValidMatch(req.want, toReq.offer)) continue;
            if (!isValidMatch(toReq.want, req.offer)) continue;

            const score = calculateMatchScoreWithSurprise(
                req.want,
                req.wantVector || [],
                toReq.offer,
                toReq.offerVector || []
            );

            if (score >= MIN_SCORE) {
                edges.get(id)!.push({ to: toId, score });
            }
        }
    }

    // 8. DFS to find cycles
    const seenCycles = new Set<string>();
    const dfs = (
        startId: string,
        currentId: string,
        path: string[],
        accScore: number
    ) => {
        if (path.length > maxCycleSize) return;

        const usersInPath = new Set(
            path.map(
                (id) =>
                    requestMap.get(id)?.user?.toString() ||
                    requestMap.get(id)?.user?._id?.toString()
            )
        );

        for (const { to, score: nextScore } of edges.get(currentId) || []) {
            if (path.includes(to)) {
                if (to === startId && path.length >= 3) {
                    const hash = path.join('-');
                    if (!seenCycles.has(hash)) {
                        seenCycles.add(hash);
                        const cycleKey = hash;
                        if (!globalSeen.has(cycleKey)) {
                            globalSeen.add(cycleKey);
                            matches.push({ ids: [...path], score: accScore });
                        }
                    }
                }
                continue;
            }

            const toRequest = requestMap.get(to);
            const toUserId =
                toRequest?.user?.toString() || toRequest?.user?._id?.toString();
            if (usersInPath.has(toUserId)) continue;

            const newScore = (accScore + nextScore) / 2;
            dfs(startId, to, [...path, to], newScore);
        }
    };

    dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

    // 9. Populate final results
    const allIds = [...new Set(matches.flatMap((m) => m.ids))];
    const populated = await BondRequest.find({ _id: { $in: allIds } })
        .select('-wantVector -offerVector')
        .populate({ path: 'user', select: 'name profile_image' })
        .lean();

    const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

    const sorted = matches.sort((a, b) => b.score - a.score);
    const total = sorted.length;
    const startIndex = (page - 1) * limit;
    const paginated = sorted.slice(startIndex, startIndex + limit);

    const result = paginated.map((m) => ({
        matchRequest: m.ids.map((id) => populatedMap.get(id)),
        matchScore: Number(m.score.toFixed(3)),
    }));

    return {
        total,
        page,
        limit,
        data: result,
    };
};

const bondRequestService = {
    createBondRequestIntoDB,
    getAllBondRequests,
    getSingleBondRequest,
    updateBondRequestIntoDB,
    deleteBondRequestFromDB,
    myBondRequests,
    getMatchingBondRequest,
    getLastBond,
};

export default bondRequestService;
