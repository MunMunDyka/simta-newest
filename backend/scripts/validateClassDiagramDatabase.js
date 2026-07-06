'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const { User, Bimbingan, Reply, Jadwal, PengajuanSeminar } = require('../models');
const SystemSetting = require('../models/SystemSetting');

const EXPECTED_COLLECTIONS = {
    users: User,
    bimbingans: Bimbingan,
    replies: Reply,
    jadwals: Jadwal,
    pengajuanseminars: PengajuanSeminar,
    systemsettings: SystemSetting
};

const MAIN_FIELDS = {
    users: [
        'nim_nip',
        'name',
        'email',
        'role',
        'prodi',
        'semester',
        'judulTA',
        'currentProgress',
        'statusMahasiswa',
        'dospem_1',
        'dospem_2',
        'penguji_1',
        'penguji_2',
        'status',
        'dokumenWisuda',
        'canAccessAdmin'
    ],
    bimbingans: [
        'mahasiswa',
        'dosen',
        'dosenType',
        'kategoriBimbingan',
        'version',
        'judul',
        'catatan',
        'fileName',
        'filePath',
        'fileSize',
        'fileOriginalName',
        'status',
        'feedback',
        'feedbackDate',
        'feedbackFile',
        'feedbackFileName',
        'hasDraft'
    ],
    replies: [
        'bimbingan',
        'sender',
        'senderRole',
        'message'
    ],
    jadwals: [
        'mahasiswa',
        'jenisJadwal',
        'tanggal',
        'waktuMulai',
        'waktuSelesai',
        'ruangan',
        'penguji',
        'status',
        'hasil',
        'nilaiSidang',
        'catatan',
        'createdBy'
    ],
    pengajuanseminars: [
        'mahasiswa',
        'jenisPengajuan',
        'fileName',
        'filePath',
        'fileSize',
        'fileOriginalName',
        'uploadedAt',
        'statusVerifikasi',
        'catatanAdmin',
        'verifiedBy',
        'verifiedAt'
    ],
    systemsettings: [
        'key',
        'value',
        'label',
        'description'
    ]
};

const OPTIONAL_FIELDS = {
    users: [
        'email',
        'prodi',
        'semester',
        'judulTA',
        'dospem_1',
        'dospem_2',
        'penguji_1',
        'penguji_2',
        'dokumenWisuda'
    ],
    bimbingans: [
        'catatan',
        'fileSize',
        'fileOriginalName',
        'feedback',
        'feedbackDate',
        'feedbackFile',
        'feedbackFileName'
    ],
    replies: [],
    jadwals: [
        'waktuSelesai',
        'ruangan',
        'penguji',
        'hasil',
        'nilaiSidang',
        'catatan',
        'createdBy'
    ],
    pengajuanseminars: [
        'fileName',
        'filePath',
        'fileSize',
        'fileOriginalName',
        'uploadedAt',
        'catatanAdmin',
        'verifiedBy',
        'verifiedAt'
    ],
    systemsettings: [
        'label',
        'description'
    ]
};

const asId = value => value && value.toString ? value.toString() : null;

const getTopLevelFields = doc => Object.keys(doc || {}).filter(key => key !== '__v').sort();

const collectTopLevelFields = docs => {
    const fields = new Set();
    docs.forEach(doc => getTopLevelFields(doc).forEach(field => fields.add(field)));
    return Array.from(fields).sort();
};

const getMainFieldComparison = (collectionName, fields) => {
    const expected = MAIN_FIELDS[collectionName] || [];
    const optional = new Set(OPTIONAL_FIELDS[collectionName] || []);

    return {
        expectedMainFields: expected,
        observedFields: fields,
        missingRequiredMainFields: expected.filter(field => !optional.has(field) && !fields.includes(field)),
        missingOptionalMainFields: expected.filter(field => optional.has(field) && !fields.includes(field)),
        extraObservedFields: fields.filter(field => !expected.includes(field) && field !== '_id' && field !== 'createdAt' && field !== 'updatedAt')
    };
};

const checkObjectIdField = (docs, field, validIds) => {
    let filled = 0;
    let invalid = 0;
    const examples = [];

    docs.forEach(doc => {
        const id = asId(doc[field]);
        if (!id) return;
        filled += 1;
        if (!validIds.has(id)) {
            invalid += 1;
            if (examples.length < 3) {
                examples.push({ documentId: asId(doc._id), value: id });
            }
        }
    });

    return { field, filled, invalid, examples };
};

const checkObjectIdArrayField = (docs, field, validIds) => {
    let filled = 0;
    let invalid = 0;
    const examples = [];

    docs.forEach(doc => {
        const values = Array.isArray(doc[field]) ? doc[field] : [];
        values.forEach(value => {
            const id = asId(value);
            if (!id) return;
            filled += 1;
            if (!validIds.has(id)) {
                invalid += 1;
                if (examples.length < 3) {
                    examples.push({ documentId: asId(doc._id), value: id });
                }
            }
        });
    });

    return { field, filled, invalid, examples };
};

const main = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI tidak ditemukan di backend/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
    });

    const db = mongoose.connection.db;
    const collectionInfos = await db.listCollections().toArray();
    const actualCollections = collectionInfos.map(info => info.name).sort();
    const expectedCollectionNames = Object.keys(EXPECTED_COLLECTIONS).sort();

    const documents = {};
    const collectionSummaries = [];

    for (const collectionName of actualCollections) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const sampleDocs = await collection.find({}).limit(25).toArray();

        documents[collectionName] = sampleDocs;
        collectionSummaries.push({
            collection: collectionName,
            count,
            observedFields: collectTopLevelFields(sampleDocs)
        });
    }

    const users = await db.collection('users').find({}).toArray();
    const bimbingans = await db.collection('bimbingans').find({}).toArray();
    const replies = await db.collection('replies').find({}).toArray();
    const jadwals = await db.collection('jadwals').find({}).toArray();
    const pengajuanseminars = await db.collection('pengajuanseminars').find({}).toArray();

    const userIds = new Set(users.map(user => asId(user._id)));
    const bimbinganIds = new Set(bimbingans.map(bimbingan => asId(bimbingan._id)));

    const referenceChecks = {
        users: [
            checkObjectIdField(users, 'dospem_1', userIds),
            checkObjectIdField(users, 'dospem_2', userIds),
            checkObjectIdField(users, 'penguji_1', userIds),
            checkObjectIdField(users, 'penguji_2', userIds)
        ],
        bimbingans: [
            checkObjectIdField(bimbingans, 'mahasiswa', userIds),
            checkObjectIdField(bimbingans, 'dosen', userIds)
        ],
        replies: [
            checkObjectIdField(replies, 'bimbingan', bimbinganIds),
            checkObjectIdField(replies, 'sender', userIds)
        ],
        jadwals: [
            checkObjectIdField(jadwals, 'mahasiswa', userIds),
            checkObjectIdArrayField(jadwals, 'penguji', userIds),
            checkObjectIdField(jadwals, 'createdBy', userIds)
        ],
        pengajuanseminars: [
            checkObjectIdField(pengajuanseminars, 'mahasiswa', userIds),
            checkObjectIdField(pengajuanseminars, 'verifiedBy', userIds)
        ]
    };

    const fieldComparisons = {};
    for (const collectionName of expectedCollectionNames) {
        const docs = documents[collectionName] || [];
        fieldComparisons[collectionName] = getMainFieldComparison(
            collectionName,
            collectTopLevelFields(docs)
        );
    }

    const roleCounts = users.reduce((acc, user) => {
        const role = user.role || '(kosong)';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const statusMahasiswaCounts = users
        .filter(user => user.role === 'mahasiswa')
        .reduce((acc, user) => {
            const status = user.statusMahasiswa || '(kosong)';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

    const result = {
        databaseName: mongoose.connection.name,
        actualCollections,
        expectedCollections: expectedCollectionNames,
        extraCollections: actualCollections.filter(name => !expectedCollectionNames.includes(name)),
        missingCollections: expectedCollectionNames.filter(name => !actualCollections.includes(name)),
        collectionSummaries,
        fieldComparisons,
        referenceChecks,
        roleCounts,
        statusMahasiswaCounts
    };

    console.log(JSON.stringify(result, null, 2));
};

main()
    .catch(error => {
        console.error(JSON.stringify({
            error: true,
            name: error.name,
            message: error.message
        }, null, 2));
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
