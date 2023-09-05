import { expect } from 'chai';
import sinon from 'sinon';
import { User } from '../../../src/model/schemas/userSchema';
import { vjudgeApi } from '../../../src/api/vjudge';
import { userUpdateEventEmitter } from '../../../src/events/UserUpdateEventEmitter';
import { storeVjudgeSubmissionEventEmitter } from '../../../src/events/StoreVjudgeSubmissionEventEmitter';


import { vjudgeUpdatesCollectorService as sut } from '../../../src/services/updates-collection/VjudgeUpdatesCollectorService';
import { logMuter } from '../../testUtils/LogMuter';

describe('vjudgeUpdatesCollectorService', function () {
  let findOneStub: sinon.SinonStub;
  let getVjudgeSubmissionStatsStub: sinon.SinonStub;
  let emitUserUpdateStub: sinon.SinonStub;
  let emitStoreVjudgeEventStub: sinon.SinonStub;

  beforeEach(() => {
    // mute console
    logMuter.muteLogs();
    sinon.stub(console, 'error');
    //stub the methods 
    findOneStub = sinon.stub(User, 'findOne');
    getVjudgeSubmissionStatsStub = sinon.stub(vjudgeApi, 'getSubmissionStats');
    emitUserUpdateStub = sinon.stub(userUpdateEventEmitter, 'emit');
    emitStoreVjudgeEventStub = sinon.stub(storeVjudgeSubmissionEventEmitter, 'emit');
  });

  afterEach(function() {
    logMuter.unmuteLogs();
    
    // Restore the stubbed methods after each test
    sinon.restore();
  });

  it('should handle user not found scenario for vjudge', async () => {
    findOneStub.resolves(null); // User not found in MongoDB

    const result = await sut.getAndStoreUpdates('testUserId');

    expect(result).to.deep.equal([]); // No updates should be returned
  });

  it('should handle user found but no VJudge username scenario', async () => {
    findOneStub.resolves({ username: 'testUser', vjudge: null }); // User found but no VJudge username

    const result = await sut.getAndStoreUpdates('testUserId');

    expect(result).to.deep.equal([]); // No updates should be returned
  });

  it('should handle Vjudge submission from new platform', async () => {
    // stub "Old" data to have 2 empty platforms
    const userId = 'testUserId';
    const username = 'testUser';
    const vjudgeUsername = 'testUserVjudgeUsername';
    findOneStub.resolves({
      _id: userId,
      username: username,
      vjudge: {
        username: vjudgeUsername,
        acRecords: {
          CodeChef: [],
          Kattis: []
        }
      }
    });
    // stub "new" data to have some submits for those platforms
    getVjudgeSubmissionStatsStub.resolves({
      username: vjudgeUsername,
      acRecords: {
        CodeChef: ["abc"],
        Kattis: ["def"],
      }
    })

    const result = await sut.getAndStoreUpdates(userId);

    // make sure the vjudge api gets called, and is called with the correct username
    expect(getVjudgeSubmissionStatsStub.calledOnce).to.be.true;
    expect(getVjudgeSubmissionStatsStub.calledWithExactly(vjudgeUsername)).to.be.true;

    // make sure the events are fired for each update, so 2 times here
    expect(emitStoreVjudgeEventStub.callCount).to.equal(2);
    expect(emitUserUpdateStub.callCount).to.equal(2);

    expect(result.length).to.equal(2);
  })

  it('should handle a new Vjudge submission from existing platform', async () => {
    // stub "Old" data to have 2 empty platforms
    const userId = 'testUserId';
    const username = 'testUser';
    const vjudgeUsername = 'testUserVjudgeUsername';
    findOneStub.resolves({
      _id: userId,
      username: username,
      vjudge: {
        username: vjudgeUsername,
        acRecords: {
          AtCoder: ["def"],
          CodeChef: ["abc"],
          Kattis: ["ghi"],
        }
      }
    });
    // stub "new" data to have some submits for those platforms
    getVjudgeSubmissionStatsStub.resolves({
      username: vjudgeUsername,
      acRecords: {
        AtCoder: ["abc", "def", "ghi"],
        CodeChef: ["abc", "def", "ghi"],
        Kattis: ["abc", "def", "ghi"],
      }
    })

    const result = await sut.getAndStoreUpdates(userId);

    // make sure the vjudge api gets called, and is called with the correct username
    expect(getVjudgeSubmissionStatsStub.calledOnce).to.be.true;
    expect(getVjudgeSubmissionStatsStub.calledWithExactly(vjudgeUsername)).to.be.true;

    // make sure the events are fired for each update, so 6 times here
    expect(emitStoreVjudgeEventStub.callCount).to.equal(6);
    expect(emitUserUpdateStub.callCount).to.equal(6);

    expect(result.length).to.equal(6);
  })
});

