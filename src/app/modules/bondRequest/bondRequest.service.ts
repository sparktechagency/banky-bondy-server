/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { isTextSafe } from '../../helper/isTextSafe';
import { generateEmbedding } from '../../utilities/embedding';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';
import { IBondRequest } from './bondRequest.interface';
import BondRequest from './bondRequest.model';

const createBondRequestIntoDB = async (
    userId: string,
    payload: IBondRequest
) => {
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

// // ----------------- Helpers -----------------
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
//     const sim = cosineSimilarity(wantVec || [], offerVec || []);
//     const overlap = tokenOverlapRatio(wantText, offerText);
//     // Weighted combination (you can tweak weights)
//     return 0.7 * sim + 0.3 * overlap;
// };

// export const isHighConfidenceMatch = (score: number) => score >= 0.7;

// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const minScore = 0.4; // default  restores earlier "partial match down to 0.4" behavior
//     const maxCycleSize = 5;
//     const MIN_SCORE = Number(minScore); // per-direction minimum
//     const isEmpty = (s?: string) => normalizeText(s) === 'empty';
//     const isSurprise = (s?: string) => normalizeText(s) === 'surprise';

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

//     // 2. Ensure embeddings exist for startRequest
//     if (!startRequest.offerVector || !startRequest.offerVector.length) {
//         startRequest.offerVector = await generateEmbedding(startRequest.offer);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { offerVector: startRequest.offerVector }
//         );
//     }
//     if (!startRequest.wantVector || !startRequest.wantVector.length) {
//         startRequest.wantVector = await generateEmbedding(startRequest.want);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { wantVector: startRequest.wantVector }
//         );
//     }

//     // 3. Geo filter (optional)
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         // radius is expected in kilometers; convert to radians by dividing by Earth radius (km)
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 4. Fetch all candidates (excluding the same bond and same user)
//     const candidates = await BondRequest.find({
//         _id: { $ne: bondRequestId },
//         user: { $ne: userId }, // avoid matching with own requests
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//         ...geoFilter,
//     })
//         .select('_id user offer want offerVector wantVector location radius')
//         .lean();

//     // quick debug helpers (you can remove these logs in production)
//     // console.debug(`[getMatchingBondRequest] candidates found: ${candidates.length}, minScore: ${MIN_SCORE}`);

//     const matches: { ids: string[]; score: number }[] = [];
//     const globalSeen = new Set<string>(); // prevent duplicates (pairs/cycles)

//     // 5. Ensure embeddings for all candidates (generate if missing)
//     for (const candidate of candidates) {
//         if (!candidate.offerVector || !candidate.offerVector.length) {
//             candidate.offerVector = await generateEmbedding(
//                 candidate.offer || ''
//             );
//             // optional: persist to DB in background if you want
//             // await BondRequest.updateOne({ _id: candidate._id }, { offerVector: candidate.offerVector });
//         }
//         if (!candidate.wantVector || !candidate.wantVector.length) {
//             candidate.wantVector = await generateEmbedding(
//                 candidate.want || ''
//             );
//             // await BondRequest.updateOne({ _id: candidate._id }, { wantVector: candidate.wantVector });
//         }
//     }

//     // 6. Pairwise 2-person matches (require both directions meet MIN_SCORE)
//     for (const candidate of candidates) {
//         // "Empty" logic: if start says Empty on offer, only match candidate who ALSO wants Empty
//         const startOfferEmpty = isEmpty(startRequest.offer);
//         const startWantEmpty = isEmpty(startRequest.want);
//         const candidateOfferEmpty = isEmpty(candidate.offer);
//         const candidateWantEmpty = isEmpty(candidate.want);

//         if (
//             (startOfferEmpty && !candidateWantEmpty) ||
//             (startWantEmpty && !candidateOfferEmpty)
//         ) {
//             continue;
//         }

//         // "Surprise" logic: treat surprise as wildcard; but skip if both sides are literally "surprise"
//         if (
//             (isSurprise(startRequest.offer) && isSurprise(candidate.want)) ||
//             (isSurprise(startRequest.want) && isSurprise(candidate.offer))
//         ) {
//             continue;
//         }

//         // calculate both directions
//         const score1 = calculateMatchScore(
//             startRequest.wantVector || [],
//             candidate.offerVector || [],
//             startRequest.want || '',
//             candidate.offer || ''
//         );
//         const score2 = calculateMatchScore(
//             candidate.wantVector || [],
//             startRequest.offerVector || [],
//             candidate.want || '',
//             startRequest.offer || ''
//         );

//         // require both directions to reach MIN_SCORE
//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             let avgScore = (score1 + score2) / 2;

//             // small bonus if either side is "surprise" (wildcard)
//             if (
//                 isSurprise(startRequest.offer) ||
//                 isSurprise(candidate.want) ||
//                 isSurprise(startRequest.want) ||
//                 isSurprise(candidate.offer)
//             ) {
//                 avgScore = Math.min(1, avgScore + 0.05);
//             }

//             // dedupe pair using sorted key
//             const pairKey = [bondRequestId, candidate._id.toString()]
//                 .slice()
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

//     // 7. Build requestMap and edges for cycles (3-5)
//     const requestMap = new Map<string, any>(
//         candidates.map((c) => [c._id.toString(), c])
//     );
//     requestMap.set(bondRequestId, startRequest);

//     const edges: Map<string, { to: string; score: number }[]> = new Map();
//     for (const [id, req] of requestMap.entries()) {
//         // ensure vectors exist (safety)
//         if (!req.offerVector || !req.offerVector.length) {
//             req.offerVector = await generateEmbedding(req.offer || '');
//         }
//         if (!req.wantVector || !req.wantVector.length) {
//             req.wantVector = await generateEmbedding(req.want || '');
//         }

//         edges.set(id, []);
//         for (const [toId, toReq] of requestMap.entries()) {
//             if (id === toId) continue;

//             // don't create edge when "empty" mismatch (same logic as pair matching)
//             if (isEmpty(req.offer) && !isEmpty(toReq.want)) continue;
//             if (isEmpty(req.want) && !isEmpty(toReq.offer)) continue;
//             if (isSurprise(req.offer) && isSurprise(toReq.want)) continue;
//             if (isSurprise(req.want) && isSurprise(toReq.offer)) continue;

//             const score = calculateMatchScore(
//                 req.wantVector || [],
//                 toReq.offerVector || [],
//                 req.want || '',
//                 toReq.offer || ''
//             );
//             if (score >= MIN_SCORE) {
//                 edges.get(id)!.push({ to: toId, score });
//             }
//         }
//     }

//     const seenCycles = new Set<string>();
//     const dfs = (
//         startId: string,
//         currentId: string,
//         path: string[],
//         accScore: number
//     ) => {
//         if (path.length > maxCycleSize) return;

//         // Get unique user IDs in current path to prevent same user appearing multiple times
//         const usersInPath = new Set(
//             path.map(
//                 (id) =>
//                     requestMap.get(id)?.user?.toString() ||
//                     requestMap.get(id)?.user?._id?.toString()
//             )
//         );

//         for (const { to, score: nextScore } of edges.get(currentId) || []) {
//             if (path.includes(to)) {
//                 // closed cycle
//                 if (to === startId && path.length >= 3) {
//                     const hash = path.join('-'); // preserve order for cycles
//                     if (!seenCycles.has(hash)) {
//                         seenCycles.add(hash);
//                         const cycleKey = hash;
//                         if (!globalSeen.has(cycleKey)) {
//                             globalSeen.add(cycleKey);
//                             matches.push({ ids: [...path], score: accScore });
//                         }
//                     }
//                 }
//                 continue;
//             }

//             // NEW: Check if the user of the 'to' request is already in the path
//             const toRequest = requestMap.get(to);
//             const toUserId =
//                 toRequest?.user?.toString() || toRequest?.user?._id?.toString();

//             // Skip this edge if the user is already in the path
//             if (usersInPath.has(toUserId)) {
//                 continue;
//             }

//             const newScore = (accScore + nextScore) / 2; // average along path
//             dfs(startId, to, [...path, to], newScore);
//         }
//     };

//     dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

//     // 9. Populate match requests
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     // 10. Sort, paginate, prepare final result
//     const sorted = matches.sort((a, b) => b.score - a.score);
//     const total = sorted.length;
//     const startIndex = (page - 1) * limit;
//     const paginated = sorted.slice(startIndex, startIndex + limit);

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

// 2nd right
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

    // Helper function for matching logic
    const isValidMatch = (want: string, offer: string) => {
        const wantSurprise = isSurprise(want);
        const offerSurprise = isSurprise(offer);

        if (wantSurprise) return true; // want surprise → matches anything
        if (offerSurprise) return wantSurprise; // offer surprise → only matches if want surprise
        return tokenOverlapRatio(want, offer) > 0; // specific want → must match offer
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

        const score1 = calculateMatchScore(
            startRequest.wantVector || [],
            candidate.offerVector || [],
            startRequest.want || '',
            candidate.offer || ''
        );
        const score2 = calculateMatchScore(
            candidate.wantVector || [],
            startRequest.offerVector || [],
            candidate.want || '',
            startRequest.offer || ''
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

            const score = calculateMatchScore(
                req.wantVector || [],
                toReq.offerVector || [],
                req.want || '',
                toReq.offer || ''
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
};

export default bondRequestService;
