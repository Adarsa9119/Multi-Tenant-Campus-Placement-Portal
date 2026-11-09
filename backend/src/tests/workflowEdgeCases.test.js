const h = require('./setup');

let w;
beforeAll(async () => { await h.start(); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); w = await h.world(); });

describe('workflow edge cases', () => {
  test('partial drive criteria updates preserve unspecified criteria', async () => {
    const response = await h.request(h.app)
      .put(`/api/drives/${w.d1._id}`)
      .set(h.auth(w.tpo1))
      .send({ criteria: { minCgpa: 8 } });

    expect(response.status).toBe(200);
    const drive = await h.M('PlacementDrive').findById(w.d1._id).lean();
    expect(drive.criteria).toMatchObject({
      minCgpa: 8,
      branches: ['CSE'],
      maxBacklogs: 0,
      graduationYear: 2027,
    });
  });

  test('a finalized failed interview result cannot later be changed to passed', async () => {
    const application = (await h.apply(w.s1, w.d1._id)).body.data;
    const updateStatus = (status) => h.request(h.app)
      .post(`/api/applications/${application._id}/status`)
      .set(h.auth(w.r1.u))
      .send({ status });
    await updateStatus('UNDER_REVIEW');
    await updateStatus('SHORTLISTED');

    const scheduled = await h.request(h.app)
      .post('/api/interviews')
      .set(h.auth(w.r1.u))
      .send({
        applicationId: application._id,
        stage: 'INTERVIEW',
        scheduledAt: new Date(Date.now() + 864e5).toISOString(),
      });
    expect(scheduled.status).toBe(201);

    const resultUrl = `/api/interviews/${scheduled.body.data._id}/result`;
    const failed = await h.request(h.app)
      .post(resultUrl)
      .set(h.auth(w.r1.u))
      .send({ result: 'FAILED' });
    expect(failed.status).toBe(200);

    const changed = await h.request(h.app)
      .post(resultUrl)
      .set(h.auth(w.r1.u))
      .send({ result: 'PASSED' });
    expect(changed.status).toBe(409);
    expect((await h.M('Interview').findById(scheduled.body.data._id)).result).toBe('FAILED');
    expect((await h.M('Application').findById(application._id)).status).toBe('REJECTED');
  });
});
