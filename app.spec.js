describe('UI Coding Exercise', function () {

  var mockApp;
  var testData = {
    testElement1: 'testElement1',
    testElement2: 'testElement2',
    testElement3: 'testElement3'
  }

  beforeEach(function(){
    mockApp = new App();
  })

  it('should contain an App object', function () {
    expect(typeof mockApp).toBe('object');
  });
  it('should call ready', function () {
    var readySpy = spyOn(mockApp, 'ready');
    mockApp.ready();
    expect(readySpy).toHaveBeenCalled();
  });
  it('should call getData and store residential data', function () {
    var getDataSpy = spyOn(mockApp, 'getData').and.callFake(function() {
      this.residentialData = testData;
    });

    spyOn(mockApp, 'getCommunities');

    mockApp.ready();

    expect(getDataSpy).toHaveBeenCalled();
    expect(mockApp.residentialData).toEqual(testData);
  });

  it('should call getData and store commercial data', function () {
    var getDataSpy = spyOn(mockApp, 'getData').and.callFake(function() {
      this.commercialData = testData;
    });

    spyOn(mockApp, 'getCommunities');

    mockApp.ready();

    expect(getDataSpy).toHaveBeenCalled();
    expect(mockApp.activeCommunity).toEqual('Hermosa');
    expect(mockApp.commercialData).toEqual(testData);
  });

});
