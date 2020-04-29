Hello, my name is Kyle Cutler.

My project is Loom: One Web Development Tool for Everyone, advised by Dr. James Heliotis.

Today, the web is ever-increasing in importance, and as a result many people from all different kinds of backgrounds want to create and work on websites. Current web development tools tend to fit into one of two categories: either they are intended for users with little or no prior experience in web development, or they are intended for advanced users such as developers, who may already know web technologies. But the separation of these tools is problematic, because it fundamentally disconnects the two categories of users, making collaboration among them difficult and preventing novice users from ever truly learning web technologies.

Loom is a desktop application for creating static web sites that aims to be useful for everyone -- from users without web experience, all the way to experienced developers, designers, and everyone in between. In addition, for those who don't already know web technologies, Loom aims to help teach these technologies to users simply by working with the tool.

To achieve these goals, Loom uses a few strategies.
* First, Loom aims to allow users to edit all aspects of the underlying technologies such as HTML and CSS, without the need to write code. This gives developers the power and flexibility that they desire, while not being intimidating to novice users.
* Next, Loom aims to provide a handful of simple, but useful abstractions in order to make working with these technologies easier. For example, Loom introduces the idea of Components, which are HTML elements that can be reused across multiple pages. This is not possible in standard HTML, but is very useful for implementing features such as a site header and footer that are reused across pages.
* Finally, Loom's user interface is designed to scale with the user. This means providing easy-to-use interfaces that novice users can pick up quickly, while also giving developers the ability to enter custom data such as textual code values. For example, a WYSIWYG interface renders the selected page and allows novice users to select and edit content in a visual way, while developers have the option of editing object properties using text-based inputs.

Internally, Loom's architecture is divided into three main parts -- including Definitions, Built Objects, and the User Interface. Definitions contain the source data that is directly modified by the user. This can include abstractions such as reusable components. Definitions are transformed into Built Objects, which correspond directly to web technologies like HTML and CSS, and can be displayed in the UI or exported to files. Loom makes heavy use of event-driven programming in order to keep each of these parts synchronized. For example, when a value changes inside a Definition, an event is emitted. Any Built Objects that rely on that value can receive the event, update themselves accordingly, and emit additional events which the UI can listen for in order to update itself. Thus, when the user changes a value they can see immediate feedback of how the resulting page has changed. For novice users, this immediate feedback helps reinforce the connection between the value they changed and the effect that it has, and for developers this enables rapid prototyping. A collection of event-driven data structures created specifically for Loom enables handling complex behaviors in an event-driven way.

To evaluate how well Loom achieves its goal of providing a useful tool for users of all backgrounds, we analyze how well it meets sample needs of three categories of users: novices, developers, and designers. As you can see on the right, Loom does not currently meet all of these sample needs, showing that there is room for improvement, and future work focuses on addressing these needs and more. Nonetheless, we have demonstrated the potential for Loom to accomplish its goal of enabling everyone to utilize and learn web technologies using one unified tool.

Thank you for listening.