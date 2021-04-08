# Distributed Dungeons and Dragons: Arena 

Distributed Dungeons and Dragons: Arena is a UDP multicast application that allows users to connect and play a simplified realisation of the popular tabletop game Dungeons and Dragons. This application plots multiple players onto one map where they must fight each other until one player is left standing to be deemed the winner. 
This Java game successfully uses UDP multicasting for communication.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

This application / server combination runs using Apache NetBeans development environment.  
The following is a link to where you can download NetBeans:

http://netbeans.apache.org/download/index.html

### Installing

After installing NetBeans, download the DDND and MCServer folders from github.  
Open both DDND and MCServer as Projects in NetBeans.   
Navigate to the MultiServerThread.java file using the 'Projects' panel.  
MCServer -> Source Packages -> com.mycompany.mcserver  
Double-Clicking the file in the projects panel will open it in the editor view. 

Navigate to the NewJFrame.java file and open it in the editor view.  
DDND -> Source Packages -> com.mycompany.ddnd  

Select the MulticastServerThread.java tab in the editor view and press the green 
play/run button to start the server. 

Select the NewJFrame.java tab in the editor view and press the green play/run button
to start a client. Multiple clients can be started this way (max of 5, but this is hardcoded and can be changed).

## Usage

Follow the instruction on the client's frame and enter a name + class into the input box (bottom-right).  

![](https://i.imgur.com/9UWgdpd.png)

After the desired number of clients have join the game, type 'start' in the command box on one of the clients. 

![](https://i.imgur.com/FLqPvbw.png)

Character movement is done by selecting the map display (left) and using the arrows keys. 

![](https://i.imgur.com/d3MU8Yc.png)

Attacks are performed by typing 'attack [direction]' in the command box. 

![](https://i.imgur.com/xSiIvxe.png)

Spells are performed by typing 'spell [direction]' in the command box.

![](https://i.imgur.com/5dpkTvk.png)

The user can use a potion to heal 10 HP by typing 'potion' in the command box. 

![](https://i.imgur.com/4RKmYAP.png)

The user can end their turn by typing 'wait' in the command box. 

![](https://i.imgur.com/bf7CdHW.png)

The last remaining character alive wins.  
Good luck.


## Acknowledgments

* NetHack! Huge inspiration for our project.
