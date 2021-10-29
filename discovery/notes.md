I am trying to see if I can hack my way through a simple PR to RStudio for a new
command to scroll the console without switching to it, which could be bound to a keyboard shortcut.

# Similar PRs:

https://github.com/rstudio/rstudio/pull/4853/files adds a word count command.

# Defining commands

[All commands with permitted contexts](../src/gwt/src/org/rstudio/studio/client/workbench/commands/Commands.cmd.xml)

[Command interfaces](../src/gwt/src/org/rstudio/studio/client/workbench/commands/Commands.java)

[Handlers for commands](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/text/TextEditingTarget.java)

# Code execution 

[Code execution for text editing target](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/EditingTargetCodeExecution.java)
  - executeRange() for executing code

[send to console event](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/events/SendToConsoleEvent.java)

[send to console implementation](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/shell/Shell.java)

# Console Classes

[Display of console interface](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/shell/editor/InputEditorDisplay.java)

  - This seems to have the right flavour of methods for console manipulation:
    - isCursorAtEnd()
    - getBounds()
    - etc.
  - Missing a setBounds()

  - The [AceEditor](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/text/AceEditor.java) implements this interface, but it also seems to be able to represent all the editors in the IDE. It has tons of methods relating to scrolling.
    

[Shell widget which contains an ace editor](../src/gwt/src/org/rstudio/studio/client/common/shell/ShellWidget.java)

# Question

How to pass an event to the AceEditor for the console from the source editor triggered by a command? I could use that event to trigger various scroll behaviours?

# Solution(?)

* Create an event: [ScrollConsoleEvent](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/events/ScrollConsoleEvent.java)
* Add it to the event bus with other similar events in [Shell](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/shell/Shell.java)
  - to handle the event we want to call a scrollConsole() method on the view_. This means [ShellDisplay] must declare the method
* Declare scrollConole() in [ShellDisplay](../src/gwt/src/org/rstudio/studio/client/common/shell/ShellDisplay.java) 
  - This means the [ShellWidget](../src/gwt/src/org/rstudio/studio/client/common/shell/ShellWidget.java) must define scrollConsole()
* Define scrollConsole() in [ShellWidget]
  - Uses some calls on the `scroll_panel_` [ScrollPanel] to implement the scroll.
* Define abstract app commands in [Commands](../src/gwt/src/org/rstudio/studio/client/workbench/commands/Commands.java):
  - scrollConsoleUp()
  - scrollConsoleDown()
* Hook up commands to implementations
  - This is a bit special, described in [CommandBinder](../src/gwt/src/org/rstudio/core/client/command/CommandBinder.java)
  - Added two command handlers, onScrollConsoleUp() and onScrollConsoleDown() to [TextInputTarget](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/text/TextEditingTarget.java)
    - these fire the scrollConsoleEvent on the event bus
* Declare commands in Commands.cmd.xml

# Incorporating the terminal

The case where the user has the terminal focused needs to be handled. Maybe the terminal could capture the same event as the console. Each only scrolls if it determines it is visible/focused?

Hunting for terminal classes:

* A likely method is to do scroll is scrollLines() on [XTermNative](../src/gwt/src/org/rstudio/studio/client/workbench/views/terminal/xterm/XTermNative.java)
* The [XTermWidget](../src/gwt/src/org/rstudio/studio/client/workbench/views/terminal/xterm/XTermWidget.java) contains the [XtermNative]
* The [TerminalSession](../src/gwt/src/org/rstudio/studio/client/workbench/views/terminal/TerminalSession.java) extends [XTermWidget]
* The [TerminalPane](../src/gwt/src/org/rstudio/studio/client/workbench/views/terminal/TerminalPane.java) manages zero or more [TerminalSession]
* This Display class of [TerminalTabPresenter](../src/gwt/src/org/rstudio/studio/client/workbench/views/terminal/TerminalTabPresenter.java) is a [TerminalPane]
* [TerminalTab](../src/gwt/src/org/rstudio/studio/client/workbench/views/terminal/TerminalTab.java) extends the [TerminalTabPresenter]


The Looks like the scroll event needs to be captured in the [TerminalTab] with an implementation for scroll somewhere down the tree.

# Trying to build RStudio desktop

## Cmake

cmake .. -DRSTUDIO_TARGET=Desktop -DRSTUDIO_PACKAGE_BUILD=1 -DCMAKE_BUILD_TYPE=Debug

## Java build issues

I couldn't build with dependencies installed from [install-dependencies-focal](../dependencies/linux/install-dependencies-focal). There was an issue relating to jar files being imported in multiple places in the source, e.g. :

```java
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
```
Trips up the compiler errors: "The package org.w3c.dom is accessible from more than one module <unnamed> javax.xml" etc.

In [CommandBundleGenerator](../src/gwt/src/org/rstudio/core/rebind/command/CommandBundleGenerator.java). Some Googling suggests this due to changes in Java 9+.

I noticed the docker file handles the Java deps slightly differently. It installs the `openjdk-8-jdk` packages as well as `openjdk-11-jdk` but seems to set the default java to 8 with: `update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java`.