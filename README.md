# LHAtlas
An atlas application designed for LibreHealth. The app runs on NodeJS and MySQL. A demo can be found [here](https://lhatlas.herokuapp.com/).

### Setup
- Fork and Clone Repo
- Create A MySQL Database and use the following initiation code.
```
  CREATE TABLE `atlas` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(60) NOT NULL DEFAULT '',
    `description` varchar(300) DEFAULT NULL,
    `location` varchar(255) DEFAULT '',
    `latitude` float NOT NULL,
    `longitude` float NOT NULL,
    `website` varchar(60) DEFAULT NULL,
    `patients` int(11) DEFAULT NULL,
    `email` varchar(35) DEFAULT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8;
  
  CREATE TABLE `products` (
  `product_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_name` varchar(60) DEFAULT NULL,
  `product_desc` varchar(255) DEFAULT NULL,
  `marker_pcolor` varchar(20) DEFAULT NULL,
  `marker_scolor` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;

CREATE TABLE `versions` (
  `version_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `version_name` varchar(15) NOT NULL,
  PRIMARY KEY (`version_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `versions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8;

CREATE TABLE `versionatlas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `atlas_id` int(11) unsigned NOT NULL,
  `version_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=661 DEFAULT CHARSET=utf8;

  CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL DEFAULT '',
  `password` varchar(60) NOT NULL DEFAULT '',
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8;
```

- Then open up .env file at the root of the repository and add the following information.
```
DB_HOST=YOUR_DB_HOST
DB_USER=YOUR_DB_USER
DB_PASS=YOUR_DB_PASSWORD
DB_NAME=YOUR_DB_NAME
jwtSecret = YOUR_JWT_SECRET
```

- Finally, run `npm install` and `node index.js` to start the atlas!
