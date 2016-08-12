// Coding Exercise
// Ray Perry
// 08/10/16

// TODO: UPDATE YOUR TESTS.
// TODO: Separate functionality.
// TODO: Selectable community
// TODO: Working controls
// TODO: UI virtualization
// TODO: Pagination
// TODO: UI facelift

'use strict';

// Main App container.
function App(){
  this.activeCommunity = '';

  // For switching the API store.
  this.apiType = '';

  // For building the API calls.
  this.pendingApiCall = '';
  this.baseApiUrl = 'https://data.cityofchicago.org/resource/energy-usage-2010.json';
  this.activeViewUrl = '?community_area_name=';
  this.buildingTypeUrl = '&building_type=';
  this.selectFieldsUrl = '&%24select=building_type%2Cbuilding_subtype%2Ctotal_kwh%2Ctotal_therms';
  this.selectCommunitiesUrl = '?%24select=community_area_name&%24group=community_area_name';
  this.apiLimiterUrl = '&%24limit=1';

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
  ready: ready,
  getData: getData,
  onData: onData,
  whenDone: whenDone,
  getTotals: getTotals,
  getCommunities: getCommunities,
  setActiveCommunity: setActiveCommunity,
  attachControls: attachControls
}

///////////

// Main callback.
// Called only when the DOM is ready.
function ready() {
  // Set up the charts?


  // Get the communities.
  this.getCommunities();

  // Set active community.
  this.setActiveCommunity('Hermosa');

  // Set up controls
  this.attachControls();
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
  this.pendingApiCall = this.baseApiUrl + this.activeViewUrl + this.activeCommunity + this.buildingTypeUrl + this.apiType;
  // Limit the columns we get from the API.
  this.pendingApiCall += this.selectFieldsUrl;
  // If debug is true, add a limit to the API requests.
  if (debug) {
    this.pendingApiCall += this.apiLimiterUrl;
  }

  // Make a GET request to the API.
  oboe(this.pendingApiCall)
    // Run app.whenDone when complete.
    .done(this.whenDone.bind(this))
    // Error handling.
    .fail(function(err) {
        console.log('We failed, somehow? ', err);
    });
}

// Handle a chunk of data from the JSON stream.
function onData(chunk, path, ancestors) {


}

// When the JSON is completely done, store it appropriately.
function whenDone(data) {

  // Use d3 to add elements if the data wasn't there last call.
  // We just change the bg-color if is a Commercial entry, for now.
  d3
    .select('#data')
    .selectAll('div')
    .data(data)
    .enter()
    .append('div')
    .attr('class', 'w-100 br4 dt h-100 pa1')
    .append('div')
    .attr('class', 'data w-10 f4 tc v-mid dtc bg-light-yellow')
    .append('p')
    .text(function(d){
      return data.indexOf(d) + 1;
    })
    .select(function() {
      return this.parentNode.parentNode;
    })
    .insert('div')
    .attr('class', function(d) {
      var c = 'w-90 f5 pa3 dtc center ';
      (d.building_type === 'Commercial') ? c += 'bg-light-red' : c += 'bg-light-blue';
      return c;
    })
    .append('p')
    .attr('class', 'mv2')
    .text(function(d) {
      return 'Building Subtype: ' + d.building_subtype;
    })
    .append('p')
    .attr('class', 'mv2')
    .text(function(d) {
      return 'Total Therms: ' + d.total_therms;
    })
    .append('p')
    .attr('class', 'mv2')
    .text(function(d) {
      return 'Total kWh: ' + d.total_kwh;
    });

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

// Get all communities.
function getCommunities() {

  // Reset communities.
  this.communities = [];

  // Make the request.
  this.pendingApiCall = this.baseApiUrl + this.selectCommunitiesUrl;
  oboe(this.pendingApiCall)
     .done(function(data) {
       this.communities = data;
       var comSelect = d3.select('#communities');

       comSelect
        .selectAll('option')
        .data(data)
        .enter()
        .append('option')
        .text(function(d) {
          return d.community_area_name;
        })
        .attr('value',function(d) {
          return d.community_area_name;
        });

       comSelect
         .on('change', function() {
           var newCom = d3.select(this).property('value');
           app.setActiveCommunity(newCom);
         });
    })
    .fail(function(err) {
      console.log('We failed, somehow? ', err);
    })

}

// Set the active community
function setActiveCommunity(community) {
  if (!community) {
    throw 'setActiveCommunity: Missing community';
  }

  this.residentialData = [];
  this.commercialData = [];

  d3.selectAll('#data div').remove();

  this.activeCommunity = community;
  d3
    .select('#title p')
    .text(community);

  // Get initial data, residential first.
  this.getData('Residential');
}

function attachControls() {}



////////////////
