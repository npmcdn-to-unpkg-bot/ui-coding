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
  it('should call onReady', function () {
    var onReadySpy = spyOn(mockApp, 'onReady');
    mockApp.onReady();
    expect(onReadySpy).toHaveBeenCalled();
  });
  it('should call getData and store residential data', function () {
    var getDataSpy = spyOn(mockApp, 'getData').and.callFake(function() {
      this.residentialData = testData;

      this.commercialData = testData;
    });

    mockApp.onReady();

    expect(getDataSpy).toHaveBeenCalled();
    expect(mockApp.residentialData).toEqual(testData);
    expect(mockApp.commercialData).toEqual(testData);

  });
});
