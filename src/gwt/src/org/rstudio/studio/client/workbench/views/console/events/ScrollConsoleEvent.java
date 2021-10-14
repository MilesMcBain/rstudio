package org.rstudio.studio.client.workbench.views.console.events;

import com.google.gwt.event.shared.EventHandler;
import org.rstudio.core.client.js.JavaScriptSerializable;
import org.rstudio.studio.client.application.events.CrossWindowEvent;

@JavaScriptSerializable
public class ScrollConsoleEvent extends CrossWindowEvent<ScrollConsoleEvent.Handler> 
{
  
  public static final Type<Handler> TYPE = new Type<>();

  public interface Handler extends EventHandler
  {
    void onScrollConsole(ScrollConsoleEvent event);
  }

  public enum ScrollDirection
  {
    Up,
    Down
  }

  public ScrollConsoleEvent(ScrollDirection direction)
  {
    direction_ = direction;
  }

   @Override
   public Type<Handler> getAssociatedType()
   {
      return TYPE;
   }

   @Override
   protected void dispatch(Handler scrollConsoleHandler)
   {
      scrollConsoleHandler.onScrollConsole(this);
   }

   public ScrollDirection getDirection()
   {
     return direction_;
   }

  private ScrollDirection direction_;
}
