# John Ousterhout: A Philosophy of Software Design

Software design is ultimately about _problem decomposition_: taking a complex problem and dividing it into smaller pieces that can be solved independently from each other. The following points are derived from the author's own development experiences as well as him teaching a Stanford course on software design (CS 190), in which students work through practical projects and try to apply the author's design principles in a series of iterative approaches to the project work.

It goes without saying - but the author specifically mentions it - that each of the techniques and design principles should not be applied without thought. The overall goal is always to reduce complexity and if that goal isn't met by using one of the principles, it must not be applied.

Also, almost all points are kind of abstract and high-level, sometimes even philosophical. They should be appreciated with actual code to go along, be it through reviewing other people's code or by looking at one's own. The former is preferred, since it's almost always easier to see design problems in code that hasn't been written by oneself.

## Complexity

Complexity, according to Ousterhout:

> "[...] is anything related to the structure of a software system that makes it hard to understand and modify the system."

Complexity can be understood in terms of cost and benefit as well. In a complex system, making a small changes takes a lot of work, while in a simple system even large changes can be implemented with rather small efforts. It should be noted that for the purposes of considering complexity it does not necessarily correlate with the overall size of a system. Even a large system with many features can be regarded as "simple" if it is easy to work with (though, in reality, many large systems are also complex).

Complexity accumulates over time as a program grows and has features added to it. It's becoming harder to keep all factors in mind when modifying the software, leading to bugs and overall slower development. It is _incremental_ and almost never caused by a single mistake.

Complexity can be decreased in two ways:

- making code simpler and more obvious (e.g. by eliminating special cases or using identifiers consistently)
- encapsulating it with _modular design_, where each part can be worked on without being exposed to all the complexity at once

Incremental development (i.e. an agile development approach) allows constant rethinking of design choices, allowing the reduction of complexity whenever it is identified in the current design.

Complexity manifests itself in three ways:

- Change amplification (a small change requires modifications in many places)
- Cognitive load (a substantial amount of knowledge that a developer requires to make a change)
- Unknown unknowns (an obvious piece of knowledge that is required to make the change)

The latter is by far the worst problem, since those unknowns are by their nature unobvious, leading to possible bugs that will only appear after a change has been made. It is therefore of utmost importance that a system is designed to be _obvious_.

Complexity is caused by two major factors:

- dependencies
- obscurity

A _dependency_ in that context exists when a piece of code cannot be understood and/or modified in isolation; instead there is related code that must also be changed or at least considered. Dependencies are inherent to software and they aren't bad per se (in fact, they are introduced intentionally in software design). Yet the goal should be to minimize them and keep them as obvious and simple as possible.

_Obscurity_ can have different root causes. It occurs when important information is not obvious, like a method or variable being named in an indesriptive way that does not convey much information (like the generic name `time` for a variable that doesn't specify what kind of time, in which format etc.).

When those two factors accumulate, complexity is born, ultimately making it difficult and risky to implement changes to a code base.

## Strategic vs. Tactical Programming

_Tactical Programming_ is an approach where the main goal is to create something working, like a feature or a bug fix. Finishing as quickly as possible often goas along with this approach, making planning for the future less important. As a result, complexity is considered as a worthy trade-off to complete a task.

_Strategic Programming_, on the other hand, has its foundation in the realization that _working code is not enough_. The long-term structure of the system is considered to be most important, so facilitating extensibility and good design is the focus.

Investing 10-20% of the total development time towards small improvements for the overall system design and structure leads to benefits in the long run that get larger the more time passes.

## Deep Modules

Splitting code up into separate modules (_modular design_) is important to allow a developer to only focus on a single bit of complexity of a system when making changes or adding new functionality.

The term "module" in this context refers to a single part of an overall system, be it a class, a subsystem or a service. Ideally, each of these modules would be able to exist without knowing about any other parts of the system, but this can never be true: modules need to know about other modules when interacting with them, creating _dependencies_. Any method that receives arguments creates a dependency to itself because code that invokes that method needs to know its signature. The goal of modular design is therefore to minimize those dependencies as much as possible.

A module should be thought of having two parts: an _interface_ and an _implementation_. The interface describes the _what_ while the implementation deals with the _how_, so the interface is the promise that gets fulfilled by the actual implementation.

While this distinction evokes strong ties to object-oriented programming, a module can really be any part of a system. An HTTP service can have an interface as well, so the idea of a module is not restricted to a certain programming paradigm.

The distinction between _interface_ and _implementation_ creates a form of abstraction: the interface is a simplified view of the module, making the underlying implementation unimportant for a user.

Besides the _formal information_ contained in an interface (the code itself, i.e. method signatures, parameter types), there is also _informal information_ (anything a developer needs to know to be able to use a module, e.g. the order in which methods need to be called) that can only specified by using comments or other documentation.

Ideally, a module should have an interface that is much smaller than its implementation. This provides two benefits:

- small interfaces minimize the complexity when used in the rest of the system
- if there are changes in the module that do not affect the interface (for which the chance is higher if the interface is small), no other module will be affected

Having a small interface hiding a lot of functionality means that the module is _deep_. This provides the best cost/benefit ratio when considering a module's interface as the cost (in terms of complexity) and the functionality it provides through it as the benefit. A great example for a deep module is the Unix/Linux file I/O: there are five basic I/O system calls (`open`, `read`, `write`, `lseek` and `close`) with simple signatures. Modern implementations of file systems require many thousands of lines of code, but they are unimportant for the user of the I/O module. And while the underlying functionality has changed considerably over the years, the interface of those system calls has remained unchanged for a long time.

The opposite of a deep module would be a shallow one:

> "A shallow moduile is one whose interface is complicated relative to the functionality it provides."

## Information Hiding and Leakage

Closely related to the concept of deep modules is _information hiding_: when information is hidden in a module, meaning it's not exposed through its interface, the amount of functionality is increased while also reducing the interface, ultimately making the module deep.

Hiding information leads to easier evolution: if a piece of information is hidden, any design changes related to that information only affects that module. One good example would be the parsing of a JSON document: if the interface exposes only methods related to the parsing and serialization, the uderlying implementation of the parser can be completely changed without impacting any other module that relies on the module.

The opposite of information hiding is _information leaking_, occuring when a design decision is reflected in more than one module. It creates a dependecy and whenever that design needs changes, it will affect all modules that are involved. Information leakage does not happen through an interface, it can also be created through dependecies inside a module's functionality, e.g. by knowing about the specifics of a file or data format. If the format changes, all modules with that knowledge need to be changed as well.

A very common cause for information leakage is _temporal decomposition_, when execution order is reflected in the structure of the. Operations that happen at different times get split into different methods or classes but using the same knowledge or information. An example would be creating methods to read a file, modify its contents and save it again: if reading and writing are split up, they share knowledge about the file format. When that changes, both mechanisms need to be changed. Instead, the better way is to unify those two operations into a single one so that the knowledge about the file format is constrained to a single implementation.

> "When designing modules, focus on the knowledge that's needed to perform each task, not the order in which tasks occur."

Another good way of hiding information is by using sensible defaults. The most common operation should be easiest to do, with edge cases or special configuration being available if needed, but hidden with defaults. For example, a method should require a small number of arguments for the standard use case, allowing overrides or additional configuration through optional parameters that are hidden when that fine-grained control is not needed.

## General-Purpose Modules

One of the most common decision to be made when designing a module is between implementing it in a generla-purpose or a special-purpose way. There are proponents of always taking a general-purpose approach, but the fact that future requirements are often uncertain might lead to unnecessary functionality or functionality that is hard to use for the specific purpose that it was created for. The sweet spot would be to make modules in a _somewhat general-purpose_ fashion. This

> "[...] means that the module's functionality should reflect your current needs, but its interface should not."

Finding the right balance between general-purpose and special-purpose designs is hard, but answering several question can help in the process:

- What is the simplest interface that will cover all your current needs?
- In how many situations will this method be used?
- Is this API easy to use for your current needs?

In keeping interfaces general-pupose, they tend to be simpler, with fewer methods that in turn are deeper.

## Layers of Abstraction

Most software systems are composed in layers, with higher layers using functionality provided by the lower layers. If that system is well-designed, each layer has a different abstraction from those above and below it. When adjacent layers have similar abstractions it reflects a potential problem:

1. _Pass-Through Methods_ - Those method's purpose is often to pass arguments to another method, usually even with the same method signature. When these are present, there is likely confusion about the division of responsibilities between classes or layers.
2. _Decorators_ - While decorators have their usage (`<3`), they have a tendency of being shallow and acting as pass-through blocks.
3. _Pass-Through Variables_ - Information that is being handed through multiple layers creates complexity, since every intermediary layer needs to be aware of that piece of information. Resolving the need for those variables can be tricky, since concepts like global variables or context stores come with their own downsides as well.

## Pull Complexity Downwards

The rule of thumb is: a module has more users than developers. So handling complexity should happen inside a module (i.e. let the single developer suffer compared to the many users of that module). In other words:

> "It is more important for a module to have a simple interface than a simple implementation."

Good examples for the temptation of making it easier for oneself as the developer: configuration parameters (having to know these as a user compared to creating sensible defaults when they are omitted) or throwing exceptions (letting the user deal with them instead of having a way to recover from them in the implementation code).

## Keeping Things Together Or Splitting Them Apart?

Given two pieces of functionalit, the question in software design is often: should they be implemented together or in separate places? Examples would be: should I/O buffering be implemented in the same place as stream-oriented file I/O or should it be a separate class? Should HTTP request parsing be one method or divided into multiple methods (or even classes)?

The overall goal should always be to reduce complexity and to improve modularity. But those two ideas can contradict each other: splitting everything into as many small modules as possible can increase complexity. Depending on how related to pices of code are, they might be better kept together or being broken apart. Good signs for when they are related are:

- if they share information
- if they are commonly used together, so keeping them together will simplify the interface
- if they overlap conceptually
- if it is hard to understand one pice of code without the other

## Define Errors Out Of Existence

Exception and error handling is a primary source of complexity. Dealing with special cases, even though they are rare, adds a high cost to a low benefit case. The general advice would therefore be to heavily reduce the number of cases where exceptions must be handled and to instead handle them internally so that there is no exceptional condition to report (thus _defining them out of existence_).

Exceptions can easily snowball. They are by definition already interrupting a program's flow, but can also lead to opportunities for more exceptions. Exception handling also tends to be verbose in many languages and they can be hard to test (like I/O excpetion handling).

The concept of defining errors out of existence can best be described with an example of Ousterhouts Tcl language design:

There is an `unset` method in that language that is used to remove a variable. If the variable doesn't exist it throws an exception. However, most commonly `unset` is used as a cleanup along the lines of "let's make sure that this variable doesn't exist anymore". For that case, it doesn't matter whether the variable existed in the first place, so handling that potential exception adds unnecessary complexity.

So `unset` should have a different definition: rather than "deleting a variable", its definition should have been "ensure that the variable no longer exists". With the second definition there is no need to throw an exception when it is invoked with a non-existing variable name. There is simply no error case to report.

There are many examples in programming languages where a method's or classes definition could be or was changed to reduce the number of error case and therefore the number of exceptions or error cases to handle for a user. Array-based methods commonly have to decide what to do with out-of bounds indices. A substring method could throw an exception if one of the index arguments is out-of-bounds or it could simply default to the start or end of the string in those cases, defining the error out of existence.

The same goes for special cases that often litter code with if statements or other nested constructs. Instead, whenever possible it is best to design the normal case to also be able to incorporate sepcial cases. An example would be text selection: The normal case (text is selected) should allow for an empty selection to indicate the special case of no text being selected (resulting in an invisible selection).

Another technique would be to _mask_ exceptions. In a TCP module, lost packets could be automatically resent so that the user does not need to handle these cases. This is especially important if handling that error would result in a very obvious operations (liek resending the package).

However, there are exceptions that are necessary. In those cases it can still make sense to at least _aggregate_ them, meaning they are caught at a higher level. Catching many individual errors can lead to duplicate code (when the same error should be presented to the user). Aggregating that catching in one place at a higher layer can lead to reduced complexity.

## Design It Twice
