# Banana

__NOTE__: You have reached the Banana repository. 
The Banana project is a fork of Kibana 3, which can be found at [http://three.kibana.org](http://three.kibana.org)
The goal is to port the code to work with Apache Solr as a backend storage. 
 
## IMPORTANT

Pull the repo from the "release" branch; version 1.0 is tagged as banana-1.0.

## Overview

Banana is Apache Licensed and serves as a visualizer and search interface to timestamped data sets stored in Solr, such as log files, Twitter streams, etc. Banana is designed to be easy to start-up with (just like Kibana from which it is forked). Data can be ingested into Solr through a variety of ways, including Solr Output Plug-in for LogStash, Flume and other connectors.


### Requirements
* A modern web browser. The latest version of Chrome, Safari and Firefox have been tested to work.
* A webserver. 
* A browser reachable Solr server. The Solr endpoint must be open, or a proxy configured to allow access to it.

### Installation and QuickStart


#### Run Banana Web App within your existing Solr instance
Run Solr at least once to create the webapp directories  

		cd $SOLR_HOME/example  
		java -jar start.jar
		
Copy banana folder to $SOLR_HOME/example/solr-webapp/webapp/
 
Browse to http://localhost:8983/solr/banana/src/index.html#/dashboard


If your Solr port is different, edit banana/src/config.js and enter the port you are using.

If you have not created the data collections and ingested data into Solr, you will see an error message saying "No Index found at .." Go to the Solr Output Plug-in for LogStash  Page (https://github.com/LucidWorks/solrlogmanager) to learn how to import data into your Solr instance using LogStash

If you want to save and load dashboards from Solr, copy either solr-4.4.0/kibana-int (for Solr 4.4) or solr-4.5.0/kibana-int (for Solr 4.5 and above) directories (as appropriate) into $SOLR_HOME/example/solr in order to setup the required core. Then restart Solr, and if it is not loaded already, load the core from Solr Admin.


#### QuickStart for Complete SLK Stack

We have packaged Solr, the open Source LogStash with Solr Output Plug-in and Banana, along with example collections and dashboards to make it easy for you to get started. The package is available here  (Link to be added). Unzip the package and:  
1. Run Solr  

    cd slk4.7.0/solr-4.7.0/example-logs
    java -jar start.jar  
     
Browse to http://localhost:8983/banana 
 
You will see example dashboards which you can use as a starting point for your applications.
Once again, if you choose to run Solr on a different port, please edit the config.js file.

THAT'S IT!


#### Running from a war file
Pull the repo from the "release" branch; version 1.0 is tagged as banana1.0.  Run "ant" from within the banana directory to build the war file.

    cd $BANANA_REPO_HOME  
    ant 
     
The war file will be called banana-buildnumber.war and will be located in $BANANA_REPO_HOME/build  


Copy $BANANA_REPO_HOME/build/banana-buildnumber.war to $SOLR_HOME/example/webapps/banana.war   
Copy $BANANA_REPO_HOME/jetty/banana-context.xml  to $SOLR_HOME/example/contexts/      
Run Solr:

    cd $SOLR_HOME/example/
    java -jar start.jar    
    
Browse to http://localhost:8983/banana  

	
#### Banana Web App run in a WebServer

Edit config.js to point to the Solr server that will store the Banana dashboards. You will need to make sure that a collection is created with the appropriate conf directory and schema.xml. Conf directories are available at banana/solr-4.4.0	(for Solr 4.4) and banana/solr-4.5.0 (for 4.5 and later).

The Solr server configured in config.js will serve as the default node for each dashboard; you can configure each dashboard to point to a different Solr endpoint as long as your webserver and Solr put out the correct CORS headers. See the README file under the directory fix_cors_issue for a guide.

Point your browser at your installation based on the contexts you have configured.



## FAQ

__Q__: How do I secure my solr endpoint so that users do not have access to it?   
__A__: The simplest solution is to use a nginx reverse proxy (See for example https://groups.google.com/forum/#!topic/ajax-solr/pLtYfm83I98).


_Q_: The timestamp field in my data is different from "event_timestamp". How do I modify my dashboards to account for this?   
_A_: By default, Banana assumes that the time field is "event_timestamp" If your time field is different you will just need to manually change it in ALL panels. We are reviewing this design (of allowing different time fields for different panels) and may move to one time field for all panels, based on user feedback.

### Support

Banana preserves most of the features of Kibana (from which it is forked). If you have any questions, please contact Andrew Thanalertvisuti (andrew.thanalertvisuti@lucidworks.com) or Ravi Krishnamurthy (ravi.krishnamurthy@lucidworks.com).


Introduction videos on Kibana can be found at [http://three.kibana.org/about.html](http://three.kibana.org/about.html)  


###Trademarks

Kibana is a trademark of Elasticsearch BV  
Logstash is a trademark of Elasticsearch BV



