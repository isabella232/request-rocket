import sinon from 'sinon';
import { ipcRenderer } from 'electron';
import Action from '../../../../../src/renderer/store/action-types';
import Mutation from '../../../../../src/renderer/store/mutation-types';
import Actions from '../../../../../src/renderer/store/actions';
import HttpMethod from '../../../../../src/common/method-types';
import createStore from '../../../../../src/renderer/store';
import ContentType from '../../../../../src/common/content-types';

describe('actions', () => {
  let store;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('setNetworkStatus', () => {
    it('should update the state of the network status', () => {
      store.dispatch(Action.setNetworkStatus, 'offline');
      expect(store.state.networkStatus).to.eql('offline');
    });
  });
  describe('setUrl', () => {
    it('should modify the URL of the state', () => {
      store.dispatch(Action.setUrl, 'https://new.url');
      expect(store.state.request.url).to.eql('https://new.url');
    });
  });
  describe('sendRequest', () => {
    let ipcSpy;

    beforeEach(() => {
      ipcSpy = sinon.spy(ipcRenderer, 'send');
    });

    it('should send the request URL', () => {
      store.commit(Mutation.UPDATE_URL, 'https://request.url');

      store.dispatch(Action.sendRequest);

      expect(ipcSpy).to.be.calledWith('send-request', sinon.match.has('url', 'https://request.url'));
    });
    it('should send the selected authentication with the belonging params', () => {
      const selectedAuthType = { id: 'wsse', label: 'WSSE' };
      const authParams = { key: 'wssekey', secret: 'wssesecret' };

      store.commit(Mutation.SELECT_AUTH_TYPE, selectedAuthType);
      store.commit(Mutation.SET_AUTH_PARAMS, authParams);

      store.dispatch(Action.sendRequest);

      expect(ipcSpy).to.be.calledWith('send-request', sinon.match({ authType: selectedAuthType.id, authParams }));
    });
    it('should send the request method', () => {
      store.commit(Mutation.SELECT_HTTP_METHOD, HttpMethod.POST);

      store.dispatch(Action.sendRequest);

      expect(ipcSpy).to.be.calledWith('send-request', sinon.match.has('method', HttpMethod.POST));
    });
    it('should send the request body', () => {
      store.commit(Mutation.SET_REQUEST_BODY, '{"foo": "bar"}');

      store.dispatch(Action.sendRequest);

      expect(ipcSpy).to.be.calledWith('send-request', sinon.match.has('body', '{"foo": "bar"}'));
    });
    it('should send the desired request headers', () => {
      store.dispatch(Action.sendRequest);

      expect(ipcSpy).to.be.calledWith(
        'send-request',
        sinon.match.has('headers', [{ name: 'content-type', value: 'application/json' }])
      );
    });
  });
  describe('receiveResponse', () => {
    it('should store the received response in the store', () => {
      store.dispatch(Action.receiveResponse, { response: { body: '{"key": "value"}' } });
      expect(store.state.response).to.eql({ body: '{"key": "value"}' });
    });
    it('should store the actual request headers in the store', () => {
      store.dispatch(Action.receiveResponse, { requestHeaders: { 'x-my-header': 'some_value' } });
      expect(store.state.sentRequestHeaders).to.eql({ 'x-my-header': 'some_value' });
    });
  });
  describe('selectAuthType', () => {
    it('should modify the selected auth type of the state', () => {
      const commit = sinon.spy();
      const wsseAuthType = { id: 'wsse', label: 'WSSE' };
      Actions[Action.selectAuthType]({ commit, state: store.state }, wsseAuthType.id);
      expect(commit).to.be.calledWithExactly(Mutation.SELECT_AUTH_TYPE, wsseAuthType);
    });
    it('should set auth params to their initial value', () => {
      const commit = sinon.spy();
      const wsseAuthType = { id: 'wsse', label: 'WSSE' };
      Actions[Action.selectAuthType]({ commit, state: store.state }, wsseAuthType.id);
      expect(commit).to.be.calledWithExactly(Mutation.SELECT_AUTH_TYPE, wsseAuthType);
      expect(commit).to.be.calledWithExactly(Mutation.SET_AUTH_PARAMS, {});
    });
  });
  describe('selectHttpMethod', () => {
    it('should modify the selected http method of the state', () => {
      const commit = sinon.spy();
      Actions[Action.selectHttpMethod]({ commit }, HttpMethod.GET);
      expect(commit).to.be.calledWithExactly(Mutation.SELECT_HTTP_METHOD, HttpMethod.GET);
    });
  });
  describe('setAuthParams', () => {
    it('should modify the parameters of the auth', () => {
      const commit = sinon.spy();
      const wsseParams = { key: null, secret: null };
      Actions[Action.setAuthParams]({ commit }, wsseParams);
      expect(commit).to.be.calledWithExactly(Mutation.SET_AUTH_PARAMS, wsseParams);
    });
  });
  describe('setRequestBody', () => {
    it('should modify the request body', () => {
      const commit = sinon.spy();
      const requestBody = '{"foo":"bar"}';
      Actions[Action.setRequestBody]({ commit }, requestBody);
      expect(commit).to.be.calledWithExactly(Mutation.SET_REQUEST_BODY, requestBody);
    });
  });
  describe('selectContentType', () => {
    it('should modify the selected content type of the state', () => {
      const commit = sinon.spy();
      Actions[Action.selectContentType]({ commit }, ContentType.json);
      expect(commit).to.be.calledWithExactly(Mutation.SELECT_CONTENT_TYPE, ContentType.json);
    });
  });
});
