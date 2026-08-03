# static-sites
a place for static html based sites

The static sites are hosted at www.eidodigital.com/folder-path-above/

Add a folder, with an index.html page, deploy and it will be available. 

Note. The author-sites are hosted using cloudflare pages. The IO team can advise on that. 


# Lites Demo

This is a page used by sales to demo the lites content to customers. It was previously hosted on the legacy download centre server, but has been moved here. 

The use case is that some customers want to embed patient information on their websites, which led to the production of 'lites' functionality. It is a reduced feed of the patient information article, with no risk rates. It is not medico legally robust enough for informed consent. 

The packaged Lites page is a small browser UI that lists territories, document codes, and titles, then renders EIDO Lite content in the right-hand panel. 

Customers can use the javascript files provided to interact with an AWS S3 bucket, where XML files are stored. The requested XML file is pulled, then content transformed and pushed into the HTML page where indicated. 

Note that the XML is very out of date and was produced before the new Editorial CMS was brought online in Feb 2025. 
There may be a way to update this XML, but would require dev. 
