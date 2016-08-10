// Coding Exercise
// Ray Perry
// 08/10/16

'use strict';

// Main App container.
function App(){

  // For switching the API store.
  this.apiType = '';
  // For building the API calls.
  this.pendingApiCall = '';
  this.baseApiUrl = 'https://data.cityofchicago.org/resource/energy-usage-2010.json?community_area_name=Hermosa&building_type=';
  this.selectFromApi = '&%24select=building_type%2Cbuilding_subtype%2Ctotal_kwh%2Ctotal_therms';
  // For storing the data and the totals.
  this.residentialData = [];
  this.commercialData = [];
  this.residentialTotals = {};
  this.commercialTotals = {};
  // Can we safely use the data?
  this.dataReady = false;
}

// App functions.
App.prototype = {
  onReady: onReady,
  getData: getData,
  onData: onData,
  whenDone: whenDone,
  getTotals: getTotals
}

// Activate the app.
var app = new App();

// Wait for the DOM to get ready.
document.addEventListener('DOMContentLoaded', app.onReady());

///////////

// Main callback.
// Called only when the DOM is ready.
function onReady() {
  // Set up the charts?
  // Get initial data, residential first.
  this.getData('Residential');
}

// Makes the required API calls.
function getData(type, debug) {
  // If we don't specify the type, fail.
  if (!type) {
    throw 'getData: Missing type';
  }

  // Set a reminder on where to store the data.
  this.apiType = type;

  // Create the API request.
  this.pendingApiCall = this.baseApiUrl + type;
  // Limit the columns we get from the API.
  this.pendingApiCall += this.selectFromApi;
  // If debug is true, add a limit to the API requests.
  if (debug) {
    this.pendingApiCall += '&%24limit=1';
  }

  // Make a GET request to the API.
  var count = 0;
  oboe(this.pendingApiCall)
    // If any chunk contains one of the keys below, call app.onData.
    .node('{building_type building_subtype total_kwh total_therms}', this.onData)
    // Run app.whenDone when complete.
    .done(this.whenDone.bind(this))
    // Error handling.
    .fail(function(err) {
        console.log('We failed, somehow? ', err);
    });
}

// Handle a chunk of data from the JSON stream.
function onData(chunk, path, ancestors) {

  // Use d3 to add elements if the data wasn't there last call.
  // We just change the bg-color if is a Commercial entry, for now.
  d3
    .selectAll('#data div')
    .data([chunk])
    .enter()
    .append('div')
    .attr('class', 'w-100 br4 dt h-100 pv3')
    .append('div')
    .attr('class', 'w-20 f4 tc v-mid dtc bg-light-yellow')
    .append('p')
    .text(ancestors[0].length)
    .select(function(){
      return this.parentNode.parentNode;
    })
    .insert('div')
    .attr('class', function(d) {
      var c = 'w-80 f5 pa3 dtc center ';
      (d.building_type === 'Commercial') ? c += 'bg-light-red' : c += 'bg-light-blue';
      return c;
    })
    .append('p')
    .text(function(d) {
      return 'Building Subtype: ' + d.building_subtype;
    })
    .append('p')
    .text(function(d) {
      return 'Total Therms: ' + d.total_therms;
    })
    .append('p')
    .text(function(d) {
      return 'Total kWh: ' + d.total_kwh;
    });


}

// When the JSON is completely done, store it appropriately.
function whenDone(data) {
  switch (this.apiType) {
    case 'Residential':
      this.residentialData = data;
      break;
    case 'Commercial':
      this.commercialData = data;
      break;
    default:
      throw 'whenDone: No data assignment';
  }
  // Did we get commercial data?
  if (!this.commercialData || this.commercialData.length === 0) {
    this.getData('Commercial');
  }
  // Do we have both datasets? Are they both arrays?
  if (Array.isArray(this.commercialData) && Array.isArray(this.residentialData) && this.commercialData.length > 0 && this.residentialData.length > 0) {
    this.dataReady = true;
  }
}

// (DEPRECATED) Gets the totals of all the fields.
// Guess what doesn't work without a bignum library? :D
function getTotals() {

  /*
  this.residentialTotals.totalKwh = 0;
  this.residentialTotals.totalTherms = 0;
  this.commercialTotals.totalKwh = 0;
  this.commercialTotals.totalTherms = 0;

  this.residentialData.forEach(function(curr, idx, arr) {
    this.residentialTotals.totalKwh += parseInt(curr.total_kwh, 10);
    this.residentialTotals.totalTherms += parseInt(curr.total_therms, 10);
  }, this);
  this.commercialData.forEach(function(curr, idx, arr) {
    this.commercialTotals.totalKwh += parseInt(curr.total_kwh, 10);
    this.commercialTotals.totalTherms += parseInt(curr.total_therms, 10);
  }, this);
  */

  console.log('WARNING: getTotals is no longer supported.');

}

////////////////
