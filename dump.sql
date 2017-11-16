-- MySQL dump 10.13  Distrib 5.7.19, for macos10.12 (x86_64)
--
-- Host: localhost    Database: iot
-- ------------------------------------------------------
-- Server version	5.7.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `PillBottle`
--

DROP TABLE IF EXISTS `PillBottle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PillBottle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pill` varchar(128) DEFAULT NULL,
  `course` int(11) NOT NULL,
  `description` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PillBottle`
--

LOCK TABLES `PillBottle` WRITE;
/*!40000 ALTER TABLE `PillBottle` DISABLE KEYS */;
INSERT INTO `PillBottle` VALUES (1,NULL,0,NULL),(2,'Montek',0,NULL),(18,NULL,0,NULL);
/*!40000 ALTER TABLE `PillBottle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PillBottleDosage`
--

DROP TABLE IF EXISTS `PillBottleDosage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PillBottleDosage` (
  `pillBottleId` int(11) DEFAULT NULL,
  `timestamp` time DEFAULT NULL,
  KEY `pillBottleId` (`pillBottleId`),
  CONSTRAINT `pillbottledosage_ibfk_1` FOREIGN KEY (`pillBottleId`) REFERENCES `PillBottle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PillBottleDosage`
--

LOCK TABLES `PillBottleDosage` WRITE;
/*!40000 ALTER TABLE `PillBottleDosage` DISABLE KEYS */;
INSERT INTO `PillBottleDosage` VALUES (2,'06:00:00'),(2,'15:00:00');
/*!40000 ALTER TABLE `PillBottleDosage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Type`
--

DROP TABLE IF EXISTS `Type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Type` (
  `id` int(11) NOT NULL,
  `title` varchar(32) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Type`
--

LOCK TABLES `Type` WRITE;
/*!40000 ALTER TABLE `Type` DISABLE KEYS */;
INSERT INTO `Type` VALUES (1,'Patient','Patient'),(2,'Doctor','Doctor');
/*!40000 ALTER TABLE `Type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserDevice`
--

DROP TABLE IF EXISTS `UserDevice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserDevice` (
  `userId` int(11) DEFAULT NULL,
  `platform` int(11) DEFAULT NULL,
  `deviceId` varchar(128) DEFAULT NULL,
  UNIQUE KEY `deviceId_UNIQUE` (`deviceId`),
  KEY `userId` (`userId`),
  CONSTRAINT `userdevice_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserDevice`
--

LOCK TABLES `UserDevice` WRITE;
/*!40000 ALTER TABLE `UserDevice` DISABLE KEYS */;
INSERT INTO `UserDevice` VALUES (1,1,'marshmellow'),(2,1,'marshellow'),(1,2,'marsdfsdfshellow'),(1,1,'hwllloe');
/*!40000 ALTER TABLE `UserDevice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `username` varchar(32) NOT NULL,
  `password` varchar(64) NOT NULL,
  `typeId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `typeId` (`typeId`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Om','omiyorulz','sandbox123',1),(2,'Bala','bala','blabla',2),(18,'Omi','omrussdlz','blabla',1);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userpill`
--

DROP TABLE IF EXISTS `userpill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userpill` (
  `userId` int(11) DEFAULT NULL,
  `pillBottleId` int(11) DEFAULT NULL,
  UNIQUE KEY `U_UserPill` (`userId`,`pillBottleId`),
  KEY `pillBottleId` (`pillBottleId`),
  CONSTRAINT `userpill_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userpill_ibfk_2` FOREIGN KEY (`pillBottleId`) REFERENCES `PillBottle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userpill`
--

LOCK TABLES `userpill` WRITE;
/*!40000 ALTER TABLE `userpill` DISABLE KEYS */;
INSERT INTO `userpill` VALUES (1,1),(1,2),(1,18),(2,1),(2,18);
/*!40000 ALTER TABLE `userpill` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-16  5:38:54
