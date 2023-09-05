import { expect } from 'chai';
import sinon from 'sinon';
import { User } from '../../../src/model/schemas/userSchema';
import { userUpdateEventEmitter } from '../../../src/events/UserUpdateEventEmitter';

import { leetcodeUpdatesCollectorService as sut } from '../../../src/services/updates-collection/LeetcodeUpdatesCollectorService'
import { leetcodeApi } from '../../../src/api/leetcode';
import { refreshLeetcodeDataEventEmitter } from '../../../src/events/RefreshLeetcodeDataEventEmitter';
import { logMuter } from '../../testUtils/LogMuter';

describe('leetcodeUpdatesCollectorService', function () {
  let findOneStub: sinon.SinonStub;
  let getLeetcodeSubmitsStub: sinon.SinonStub;
  let getLatestAcSubmitsStub: sinon.SinonStub;
  let emitUserUpdateStub: sinon.SinonStub;
  let emitRefreshLeetcodeDataEvent: sinon.SinonStub;

  beforeEach(() => {
    // mute console
    logMuter.muteLogs();

    //stub the methods 
    findOneStub = sinon.stub(User, 'findOne');
    getLeetcodeSubmitsStub = sinon.stub(leetcodeApi, 'getSubmitStats');
    getLatestAcSubmitsStub = sinon.stub(leetcodeApi, 'getLatestAcceptedSubmits')
    emitUserUpdateStub = sinon.stub(userUpdateEventEmitter, 'emit');
    emitRefreshLeetcodeDataEvent = sinon.stub(refreshLeetcodeDataEventEmitter, 'emit');
  });

  afterEach(function () {
    logMuter.unmuteLogs();
    // Restore the stubbed methods after each test
    sinon.restore();
  });

  it('should handle user not found scenario for leetcode', async () => {
    findOneStub.resolves(null); // User not found in MongoDB

    const result = await sut.getAndStoreUpdates('testUserId');

    expect(result).to.deep.equal([]); // No updates should be returned
  });

  it('should handle user found but no Leetcode username scenario', async () => {
    findOneStub.resolves({ username: 'testUser', leetcode: null }); // User found but no LeetCode username

    const result = await sut.getAndStoreUpdates('testUserId');

    expect(result).to.deep.equal([]); // No updates should be returned
  });

  it('should handle new submissions scenario', async () => {

    // User has solved two problems on leetcode
    findOneStub.resolves({
      leetcode: {
        username: 'testUser',
        submitStats: {
          acSubmissionNum: [
            {
              difficulty: "All",
              count: 2,
              submissions: 5
            },
            {
              difficulty: "Easy",
              count: 1,
              submissions: 2
            },
            {
              difficulty: "Medium",
              count: 0,
              submissions: 0
            },
            {
              difficulty: "Hard",
              count: 1,
              submissions: 5
            }
          ]
        }
      }
    });

    getLeetcodeSubmitsStub.resolves({
        username: 'testUser',
        submitStats: {
          acSubmissionNum: [
            {
              difficulty: "All",
              count: 6,
              submissions: 15
            },
            {
              difficulty: "Easy",
              count: 3,
              submissions: 6
            },
            {
              difficulty: "Medium",
              count: 1,
              submissions: 1
            },
            {
              difficulty: "Hard",
              count: 2,
              submissions: 8
            }
          ]
        }
    })
    const problemNames = ['A', 'B', 'C', 'D'];
    const latestSubmitsMock = problemNames.map(name => {
      return {
        title: name,
        titleSlug: name,
        timestamp: 12345,
        lang: "cpp"
      }});
    getLatestAcSubmitsStub.resolves(latestSubmitsMock);


    const result = await sut.getAndStoreUpdates('testUserId');
    const newProblemsSolvedNames = result.map(data => data.problemTitle);

    expect(emitUserUpdateStub.callCount).to.equal(4);
    expect(emitRefreshLeetcodeDataEvent.calledOnce).to.be.true;
    

    expect(result.length).to.equal(4);
    expect(newProblemsSolvedNames).to.deep.equal(problemNames);
  });
});

