// variables to hold button/slider status
var circlesDynamicallySized = false;
var enplanementFilterVal = 0;
var firstdate = new Date(2014,05,1),
    lastdate = new Date(2015,01,1);
var fill = d3.scale.category20();
var cityData=[];// holds the list of terms that will be input in the word cloud
var copyData = null; //holds only the dataset that the user searches for.
var tempcompleteData = null; //holds the temporary complete dataset.
var emotionData = []; // hold the emotion informations
var topInterests = [];
var color2 = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

//store the emotion and words in a hashtable 
termSize = 0;
var emotionAndWords ={};

//set the default dates
/*
$("#dateslider").dateRangeSlider({
  wheelMode: "zoom",

  bounds:{
    min: new Date(2014, 05, 1),
    max: new Date(2015, 01, 01)
  }});
*/
//listener for when dateslider is changes
$("#dateslider").bind("valuesChanging", function(e,data){
 
  lastdate = Date.parse(data.values.max);
  firstdate = Date.parse(data.values.min);
  updateMap(firstdate,lastdate);

});

$("#dateslider").bind("valuesChanged", function(e, data){
  
  //updateWorldCloud(cityData);
  cityData.length=0;

});


//function to search for emotion keyword
function searchEmotion(){
  var minRadius = 3;
  var enplanementRadius = 0;
  var search = d3.select("#mySearch").property("value");
  
  //updates the points on the map
  d3.selectAll(".tweet")
        .select("circle")
        .transition(400)
        .attr("r", function(d){ 
         
            //Date.parse(d.date);  
            //if (Date.parse(d.date) >= lastdate && Date.parse(d.date) >= firstdate) {
           // if (d.sentiment == search) {  
              if ((d.sentiment == search || d.interests.search(search)!= -1) && Date.parse(d.date) >= firstdate && Date.parse(d.date) <= lastdate) { 
                return Math.max(enplanementRadius, 
                                minRadius); 
            } else {
                return 0;
            }
        }); 

   //updates the graph with the search performed     
   copyData = copyData.filter(function(d){
        if(d.sentiment == search || d.interests.search(search)!=-1){
            return true;
        }
        //d.value = parseInt(d.value, 10);
        return false;
    });

  //removes the svg element where the mini graph is found... 
  d3.select("#graph").selectAll("svg").remove(); 
  //d3.selectAll(".bars").remove();   
  //call to update the time stacked bar...
  groupByDates(copyData);  
  copyData = tempcompleteData; //fill the  copy data again witht he original data that can be used for the next search.
   /*console.log(copynestedData);
   d3.selectAll(".keydates").select("rect")
   .data(copynestedData)
   .data(function(d){return d.values})*/

  //update the stackbar chart

  //end of searchEmotion function
}

//function that is called to update the data on the map and to call the word cloud as well.... -->Do frequency count -->
function updateMap(firstdate,lastdate){
  tweetstring = null;
  cityData.length=0;//empties the cityData everytime this function is run..
  emotionData.length=0;
  tempData = [];
  var minRadius = 3;
  var enplanementRadius = 0;
  var keyword = d3.select("#mySearch").property("value");
  // the g element selected is "tweet"...
  d3.selectAll(".tweet")
    .select("circle")
    .transition(400)
    .attr("r", function(d){ 
        //Date.parse(d.date);  
        //if (Date.parse(d.date) >= lastdate && Date.parse(d.date) >= firstdate) {
        //if keyword "default was found"
        if (keyword.search("default") != -1){
            if (Date.parse(d.date) >= firstdate && Date.parse(d.date) <= lastdate) 
            {  
                return Math.max(enplanementRadius, minRadius);                     
            }
            else {return 0;}
        } 
        //if keyword "default" was not found then perform this
        else if(keyword.search("default") == -1){
          if ((d.sentiment == keyword || d.interests.search(keyword)!= -1) && Date.parse(d.date) >= firstdate && Date.parse(d.date) <= lastdate) 
          {  
            tweetstring = d.interests.removeStopWords();//removes stopwords
            //console.log(tweetstring);
            tempData = tweetstring.split("-"); //TODO here i can just remove the "-" if i selected this as the separator
            for (var i =0; i<tempData.length;i++)
            {
               cityData.push(tempData[i]);
               //console.log(tempData[i]);
               
               emotionData.push(d.sentiment); 
               
            }
            //console.log(cityData);
            //console.log(d.sentiment);

            return Math.max(enplanementRadius, minRadius); 
          }
          else {return 0;}
        }
        else {
            return 0;
        }
      
     //end of the inside function for attribute    
    });   
  
  duplicatesRemoved = removeDuplicates(cityData);
  //temporarily only call funtion
  if(duplicatesRemoved.length <=1000){
    //d3.selectAll(".wc").remove();
    //d3.select("#graph").selectAll("svg").selecremove(); 
  d3.select("#wordcloud").selectAll("svg").remove(); 
  convertToArray(cityData,emotionData);
  //calculateFrequency(emotionData);

  updateWorldCloud(duplicatesRemoved);
  //console.log("rriting citdata size",cityData.length);

  }
//console.log("Have passes updateWorld function!");
}

//To remove all duplicates from the cityData array used in the word-cloud
function removeDuplicates(cd){
  var u = {}, a = [];
   for(var i = 0, l = cd.length; i < l; ++i){
      if(u.hasOwnProperty(cd[i])) {
         continue;
      }
      a.push(cd[i]);
      u[cd[i]] = 1;
   }
   return a;

}


//calculate the actuall frequency for each word
function calculateFrequency(wordtag){
  //console.log(wordtag);
  var temp = 1;
  var finalsentiment = null;
  for (i in color.domain())
  {
    if(typeof emotionAndWords[color.domain()[i]][wordtag] == "undefined")
    {
      continue;
    }
    else {

      if(emotionAndWords[color.domain()[i]][wordtag] >= temp)
        {
      finalsentiment = color.domain()[i];//holds the sentiment of such word
      //console.log(finalsentiment); 
      temp = emotionAndWords[color.domain()[i]][wordtag]; //holds the word occurence 
      //console.log(temp);
        }
    }
  }
  //console.log(wordtag,finalsentiment);
  termSize = temp;
  //console.log("size:",termSize);
  //console.log("--------->");
  return color(cValue(finalsentiment));
}

//function to create the arrays that keep frequency of words to emotion
function convertToArray(citydata,emotiondata){
  //console.log(citydata);
  //console.log(emotiondata);
  var test = color.domain(); // ["sadness", "trust", "anger", "disgust", "joy", "fear", "anticipation", "surprise"]
 
  //add the emotions to hashtable
  for (var i in test){
  emotionAndWords[test[i]] = {} ; 
  }

  //console.log(emotionAndWords);
  for (i in citydata){
    //if (typeof emotionAndWords[emotiondata[i]][citydata[i]] != "undefined")
  
    if (typeof emotionAndWords[emotiondata[i]][citydata[i]] == "undefined")
    {
      
      emotionAndWords[emotiondata[i]][citydata[i]] =1;
    }
    else
    {
      //console.log("found a pair");
      emotionAndWords[emotiondata[i]][citydata[i]] +=1;
    }
  }
  //console.log(Object.keys(emotionAndWords));
  /*for (var value in emotionAndWords){
    console.log(value);
    for (t in emotionAndWords[value]){console.log(t);}
  //console.log(value + " -> " + emotionAndWords[value]);  
  // if (value == "name") doSomething();
  }*/ 

}

//function to fill up cloud with data -- calls calculateFrequency o figure out what color to put to label the word
function updateWorldCloud(cities){
  d3.layout.cloud().size([600, 200])//width, height
        //.timeInterval(10)
        .words(cities.map(function(d) {
            return {text: d, tagColor: calculateFrequency(d) ,size: 20 * Math.log1p(termSize)}; //10 + Math.random() * 90

        }))
        //.rotate(function() { return ~~(Math.random() * 2) * 90; })
        .rotate(0)
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        //.on("word",progress)
        .on("end", draw)
        .start();
}

//function for drawing word cloud
function draw(words) {
 
    var svg3 = d3.select("#wordcloud").append("svg")
    .attr("width", 900)
    .attr("height", 200);

    svg3.append("g")

    .attr("transform", "translate(300,100)")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .style("font-size", function(d) { return d.size + "px"; })
    .style("font-family", "Impact")
    .style("fill", function(d, i) {  return d.tagColor; })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) { return d.text; });
}     

// function to handle button click
function toggleEnplanementAirportSize() {
    circlesDynamicallySized = !circlesDynamicallySized;
    updateAirportRadius(enplanementFilterVal, 
         circlesDynamicallySized);  
}

// capitalize airport names
function capWords(sentence) {
    return sentence.replace(/[^\w](\w)/g, 
        function(w){return w.toUpperCase();});
}

// listener for when our slider is changed
d3.select("#enplanements").on("input", function() {
  updateEnplanementFilter(+this.value);
});

// function to handle enplanement slider movement
function updateEnplanementFilter(newEnplaneVal) { 
  // update the text slider
  d3.select("#sliderlabel")
     .text(newEnplaneVal.toLocaleString());

  // update the global var and the slider value
  enplanementFilterVal = newEnplaneVal;
  d3.select("#enplanements").property("value", newEnplaneVal);

  // update all the circles
  updateAirportRadius(enplanementFilterVal, 
                      circlesDynamicallySized);
}

// function to resize circles
function updateAirportRadius(enplanementFilter, circlesSized) {
  var minRadius = 1;
  var enplanementRadius = 0;
  // the g element selected is "tweet"...
  d3.selectAll(".tweet")
    .select("circle")
    .transition(400)
    .attr("r", function(d){ 
        // should use () ? : syntax here, 
        // but line width for blog!
        if (circlesSized) {
            enplanementRadius = 
                Math.sqrt(d.number) / 300.0;
        } else {
            enplanementRadius = minRadius;
        }

        if (d.number >= enplanementFilter) {
            return Math.max(enplanementRadius, 
                            minRadius); 
        } else {
            return 0;
        }
    });   
}

//************************************************************************************************************

var width = 1100,
    height = 400;

var duration = 1;

var projection = d3.geo.mercator()
   .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);

var svg = d3.select("#tweetcanvas").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geo.path()
    .projection(projection);

var g = svg.append("g");

svg.append("g")
.append("g")
//.append("g")
.attr("class","wc")
 .attr("width", 1000)
    .attr("height", 1000);

/*svg.append("g")
.append("class","minichart")
.attr("width",1000)
.attr("height",1000);*/


//this will the fill color of the sentiment/emotion
var cValue = function(d) { return d;},
    color = d3.scale.category10();

var pie = d3.layout.pie()
  .value(function(d){return d.sentiment})

//function to build interactive stack bar chart (integrated with map) , and upon selection calls the UpdateMap function
function groupByDates(data){

  // Chart dimensions
  var mini_margin = {top: 0, right: 80, bottom: 20, left: 40},
      main_margin = {top: 20, right: 80, bottom: 50, left: 40},
      main_height = 200 - main_margin.top - main_margin.bottom,
      main_width  = 1150 - main_margin.left - main_margin.right,
      mini_height = 200 - mini_margin.top - mini_margin.bottom;
  /*   var main_margin = {top: 20, right: 80, bottom: 100, left: 40},  mini_margin = {top: 585, right: 80, bottom: 20, left: 40},    main_width  = 1300 - main_margin.left - main_margin.right,    main_height = 650 - main_margin.top - main_margin.bottom,    mini_height = 650 - mini_margin.top - mini_margin.bottom;;   */
  
  // Define some offsets
  var axis_offset        = 275,
      legend_offset      = 195,
      legend_text_offset = {height: 518, width: 195},
      legend_rect_offset = {height: 525, width: 235},
      legend_interval    = 40;

  // The date format - change the graph data right here
  var dateFormat = d3.time.format("%b %d"); 

  // Define main svg element in #graph
  var svg2 = d3.select("#graph").append("svg")
      .attr("width", main_width + main_margin.left + main_margin.right)
      //.attr("height", main_height + main_margin.top + main_margin.bottom);
            //.attr("width",1000)
            .attr("height",200);

  var mini = svg2.append("g")
    .attr("transform", "translate(" + mini_margin.left + "," + mini_margin.top + ")");

  //colors for the legends of the stacked bar graph
  var colors = d3.scale.ordinal().range(["#5D5CD6","#FF7236","#5FD664","#D64041","#C53AD6","#5D5CD6","#FF7236","#5FD664"]);
  var parseDate = d3.time.format("%Y-%m-%d");

  var main_y  = d3.scale.linear().range([main_height, 0] );
  var mini_y  = d3.scale.linear().range([mini_height, 0] );
  var mini_z = d3.scale.ordinal();
  var len = 0;
  var upperemotioncount = 0;
  var tempemotioncount = 0;

  //collect the date for each row in the data-set
  data.forEach(function(d) {
      //d.sentiment = d.sentiment
      d.date = new Date(Date.parse(d.date));
      //len++;
  });

  //the variable that holds the data needed to draw the stacks for each day in the bar graph 
  var nestedData = d3.nest()
    .key(function (d){return Date.parse(d.date)}).sortKeys(d3.ascending)
    .key(function (d){return d.sentiment}).sortKeys(d3.ascending)
    .rollup(function (leaves){ return leaves.length;})
    .entries(data);

  //console.log(nestedData)

  //create the extra values needed to build the stack bar
  nestedData.forEach(function(d) {
    var y0 = 0;
    var y1 = 0;
    var date = d.key;
    //console.log(date);
    d.vis = "1";
    len++;
    d.values.forEach(function(d) {

       // console.log(d.values);
        // y0 is the y axis start of the bar
        d.y0 = y0 + y1;
        d.date = date;
        // y1 is the y axis end of the bar
        d.y1 = y1 = d.values+d.y0;
        upperemotioncount+=d.values;
       // console.log(d.y1);
        // d.vis controls whether bars are visible or not
        d.vis = "1";
    });
    // console.log(upperemotioncount);
    //upperemotioncount=0;
    if (upperemotioncount >= tempemotioncount){
      tempemotioncount=upperemotioncount;
    }
    //console.log(tempemotioncount);
    upperemotioncount=0;
  });
  
  //configure the y and x axis with a specific range
  var main_x = d3.time.scale().range([0, main_width-main_width/len/2]);
            //main_x.domain(d3.extent(data.result, function(d) { return d.date; }));
  main_x.domain([
      d3.min(data,function(d) { return d.date.setDate(d.date.getDate()); } ),                  
      d3.max(data,function(d) { return d.date.setDate(d.date.getDate()); })
  ]);
  main_y.domain([0,tempemotioncount]);
  mini_y.domain([0,tempemotioncount]);
  var mini_x = d3.time.scale().range(main_x.range()).domain(main_x.domain());;
  //console.log(mini_y.domain());

  // Create brush for mini graph
  var brush = d3.svg.brush()
      .x(mini_x)
      .on("brush", brushed);

  // Define the X axis
  var main_xAxis = d3.svg.axis()
      .scale(main_x)
      .ticks(10)
      .orient("bottom");

  //Define the Y Axis
  var mini_xAxis = d3.svg.axis()
      .scale(mini_x)
      .ticks(10)
      .orient("bottom");

  mini.append("g")
    .attr("class", "x axis mini_axis")
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(0," + mini_height + ")")
    .call(mini_xAxis);

  // Add the brush
  mini.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", -10)
    .attr("height", mini_height +15); //+15

   var mini_bar = mini.selectAll(".bars")
      .data(nestedData)
      .enter().append("g")
      .attr("class", function(d) { return "keydates"; })
      .attr("clip-path", "url(#clip)");

  mini_bar.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter().append("rect")
    //.attr("class","box")

    //.attr("transform", function(d) { console.log(main_x(Date.parse(d.date))); return "translate(" + (main_x(d.date) - (main_width/len)/2) + ",0)"; })
    .transition(1000)
    .delay(600)
    .attr("width", function(d) { return 30; })
    .attr("x", function(d) { return mini_x(d.date) - (main_width/len)/2; })
    .attr("y", function(d) { return mini_y(d.y1); })
    .attr("fill", function(d) { return color(cValue(d.key)); } )
    .attr("height", function(d) { return mini_y(d.y0) - mini_y(d.y1); });

  //create brush effect
  function brushed() {
      //main_x.domain(d3.extent(data.result, xValue));
    main_x.domain(brush.empty() ? mini_x.domain() : brush.extent());
 
    //get the brush event values (date range) and then call updateMap function to draw on Map...
    var extent = brush.extent();
    if (d3.event.sourceEvent){
      var x1 = Date.parse(extent[0]);
      var x2 = Date.parse(extent[1]);

      //Reload the Map function
      updateMap (x1,x2);
      
      console.log(x1,x2);
    }
     /* bar.selectAll("rect")
          .attr("width", function(d) { return main_width/len; })
          .attr("x", function(d) { return main_x(Date.parse(d.date)) - (main_width/len)/2; });
      main.select(".x.axis").call(main_xAxis);*/
  }

  //new Date(+d.key + 1000*3600)
  //just a sample of the data looks after it has been shown in HTML format
  /*d3.select("#ex10")
  .data(nestedData)
  .enter()
  .append("div")
  .html(function(d,i){return (i+0)+". "+new Date(+d.key + 1000*3600) +" ("+d3.sum(d.values, function(d){ return d.values;})+")";})
  .style("background-color","lightgray")
  .selectAll("div")
  .data(function(d1){return d1.values;})
  .enter()
  .append("div")
  .html(function(d2){return "Emotion:"+d2.key+", Values:"+d2.values;})
  .style("background-color","white");*/

}

//this is to draw the legend
var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5,0])
     
      .html(function(d){
            return "Tweet : "+ "<span style='color:#ededed'>" + 
            d.tweet + "</span>" + "<br>"+
            //"<br>" + "Interest Info: "+ d.interests+"<br>"+
            "Emotion" + " : " + 
            "<span style='color:" + color(cValue(d.sentiment))+ "'>" + 
            d.sentiment + 
            "</span><br>" +
            "Description: " + 
            d.description.toLocaleString()+
            "<br>Date:"+
            d.date;
          // return d.tweet;
      });  
    
svg.call(tip);//Allows for the display of tips

//To fill the keyword container
function fillKeywordContainer(){
  d3.tsv("smart_tweets_top_interests.tsv", function(data) {
    // the columns you'd like to display

    data.some(function(d) {
      topInterests.push(d.interest);
      return d.interest == 'god';
    });

    var columns = ["interest", "count"];

    var table = d3.select("#keywordcontainer").append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(topInterests)
        .enter()
        .append("th")
            .attr("style", "padding-right: 5px")
            .text(function(column) { return column; });

    // create a row for each object in the data
    /*var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");*/

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
            .text(function(d) { return d.value; });
});



}



//Main function that draw map and legend - other functions are called from here. -> Calls groupbydates to draw stack graph -> calls updateEnplanemetFilter
function updateData(){
  // load and display the World
  d3.json("https://raw.githubusercontent.com/omarsar/EmoViz/master/public/json/world.json", function(error, topology) {
    
    // load and display the cities and plots the dataset
    d3.json("https://raw.githubusercontent.com/omarsar/EmoViz/master/public/json/tweets.json", function(error, data) {
      g.selectAll("circle")
       .data(data)
       .enter().append("g")
       .attr("class","tweet")//name of g element, this is what is update above...     
       .append("circle")
       .attr("cx", function(d) { 
               return projection([d.lon, d.lat])[0];
       }, "50%")
       .attr("cy", function(d) {
               return projection([d.lon, d.lat])[1];
       }, "50%")
      .on("mouseover",function (d) {tip.show(d)}) //to display tips on mouseover
      .on("mouseout",tip.hide) //hide display on mouseout

      .attr("r", 3) //size of the dots on the map

      .style("fill", function (d) {return color(cValue(d.sentiment));}) //the value to display based on the sentiment
      .style("fill-opacity", 0.7)

    //Draws the legend for the map
    var legend = svg.selectAll(".legend26")
      .data(color.domain()) //indicates how to get the colors for the legend on the map
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
        .attr("x", 70)
        .attr("y",height -200)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
       // draw legend text
      legend.append("text")
        .attr("x",  66)
        .attr("y", height - 190)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

        //console.log(color.domain());

        //this is to copy the data to copydata variable.
    
    copyData =data; 
    tempcompleteData =data;   

    //call to draw mini graph below map
    groupByDates(data);
         
    });

    //end of the data collection function
    g.selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
          .geometries)
      .enter()
      .append("path")
      .attr("d", path)

  //end of function that collects data and draws the map      
  });

  //handles the zooming for the map
  var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("circle")
            .attr("d", path.projection(projection));
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 

    });

  svg.call(zoom)

  //Call the update points function
  updateEnplanementFilter(enplanementFilterVal);


  //This draws the keyword container:
  //fillKeywordContainer();


//end of main updateData function
}
 

//call the main function
updateData();
