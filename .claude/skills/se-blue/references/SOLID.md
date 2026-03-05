# Why SOLID Principles Are Still the Foundation for Modern Software Architecture

> Source: [Stack Overflow Blog](https://stackoverflow.blog/2021/11/01/why-solid-principles-are-still-the-foundation-for-modern-software-architecture/) (November 1, 2021)

The SOLID principles are a time-tested rubric for creating quality software. But in a world of multi-paradigm programming and cloud computing, do they still stack up? This article explores what SOLID stands for (literally and figuratively), explains why it still makes sense, and shares examples of how it can be adapted for modern computing.

## What is SOLID?

[SOLID](https://en.wikipedia.org/wiki/SOLID) is a set of principles distilled from the writings of Robert C. Martin in the early 2000s. It was proposed as a way to think specifically about the quality of object-oriented (OO) programming. As a whole, the SOLID principles make arguments for how code should be split up, which parts should be internal or exposed, and how code should use other code. Each principle below is explained with its original meaning, plus an expanded meaning that can apply outside of OO programming.

## What Has Changed?

In the early 2000s, Java and C++ were king. The popularity of Java spawned a cottage industry of books, conferences, courses, and other material to get people from writing code to writing _good_ code.

Since then, the changes in the software industry have been profound:

- **Dynamically-typed languages** such as Python, Ruby, and especially JavaScript have become just as popular as Java—overtaking it in some industries.
- **Non-object-oriented paradigms**, most notably functional programming (FP), are more common. Even Java introduced lambdas. Techniques such as metaprogramming have gained popularity. "Softer" OO flavors like Go have static typing but not inheritance. Classes and inheritance are less central in modern software.
- **Open-source software** has proliferated. Dependencies are often open-source, so the logic and data hiding that used to be imperative when writing a library is less critical.
- **Microservices** and **software as a service** have exploded. It is common to deploy small services that talk to other services rather than one big executable.

Taken as a whole, many concerns that SOLID originally addressed—classes and interfaces, data hiding, polymorphism—are no longer the daily focus of many programmers.

## What Hasn't Changed?

- **Code is written and modified by people.** Code is written once and read many times. There will always be a need for well-documented code, particularly well-documented APIs.
- **Code is organized into modules.** In some languages these are classes; in others, individual files or exported objects. There is always a need to decide how best to group code together.
- **Code can be internal or external.** Some code is for your team; other code is for other teams or external customers. We need ways to decide what is "visible" and what is "hidden."

## "Modern" SOLID

Below, each of the five SOLID principles is restated in a way that applies to OO, FP, or multi-paradigm programming. In many cases, these principles apply to whole services or systems.

The word _module_ here means any grouping of code: a class, a module, a file, etc.

## Single Responsibility Principle

**Original definition:** _"There should never be more than one reason for a class to change."_

If you write a class with many concerns, or "reasons to change," you must change the same code whenever any of those concerns changes. This increases the risk that a change to one feature will break another.

Example of a class that violates SRP:

```java
class Frankenclass {
   public void saveUserDetails(User user) { /*...*/ }
   public void performOrder(Order order) { /*...*/ }
   public void shipItem(Item item, String address) { /*...*/ }
}
```

**New definition:** _"Each module should do one thing and do it well."_

This principle is closely related to _high cohesion_. Your code should not mix multiple roles or purposes.

FP version in JavaScript:

```javascript
const saveUserDetails = user => {
  /*...*/
};
const performOrder = order => {
  /*...*/
};
const shipItem = (item, address) => {
  /*...*/
};

export { saveUserDetails, performOrder, shipItem };
```

This could also apply to microservice design: a single service handling all three functions is doing too much.

## Open-Closed Principle

**Original definition:** _"Software entities should be open for extension, but closed for modification."_

You can create classes and extend them (e.g., by subclassing), but you should not modify the original class. Making things "open for extension" reduces dependence on the original author. "Closed for modification" protects internal implementation from unskilled or unauthorized changes.

```java
class Notifier {
   public void notify(String message) {
       // send an e-mail
   }
}

class LoggingNotifier extends Notifier {
   public void notify(String message) {
       super.notify(message);
       // also log the message
   }
}
```

**New definition:** _"You should be able to use and add to a module without rewriting it."_

In FP, this requires explicit "hook points" to allow modification:

```javascript
const saveRecord = (record, save, beforeSave, afterSave) => {
  const defaultSave = record => {
    /* default save */
  };

  if (beforeSave) beforeSave(record);
  if (save) save(record);
  else defaultSave(record);
  if (afterSave) afterSave(record);
};
```

## Liskov Substitution Principle

**Original definition:** _"If S is a subtype of T, then objects of type T may be replaced with objects of type S without altering any of the desirable properties of the program."_

You should be able to use any subclass in place of its parent class. This allows confidence in the _contract_—any object that "is a" type `T` will behave like a `T`.

**New definition:** _You should be able to substitute one thing for another if those things are declared to behave the same way._

If your program "promises" to do something (e.g., implement an interface or a function), keep that promise and avoid surprising clients. Many dynamic languages use [duck typing](https://en.wikipedia.org/wiki/Duck_typing): the function declares that it expects input to behave in a particular way and proceeds on that assumption.

## Interface Segregation Principle

**Original definition:** _"Many client-specific interfaces are better than one general-purpose interface."_

Provide a "view" into your class. Instead of exposing the full implementation to all clients, create interfaces with just the methods relevant to each client. This decreases coupling and ensures clients do not depend on features they do not use.

**New definition:** _"Don't show your clients more than they need to see."_

Document only what the client needs to know. Use documentation generators to expose only "public" functions or routes and leave "private" ones un-emitted. In microservices, use documentation or separation to enforce clarity.

## Dependency Inversion Principle

**Original definition:** _"Depend upon abstractions, not concretions."_

Clients should depend on interfaces rather than concrete classes. Code should rely on the smallest possible surface area—ideally, a _contract_ defining behavior, not implementation details. This reduces the risk of a breakage in one place cascading elsewhere.

```java
interface Logger {
   public void write(String message);
}

public void doStuff(Logger logger) {
   // do stuff
   logger.write("some message");
}
```

**New definition:** _"Depend upon abstractions, not concretions."_

The same. Keeping things abstract is still important, even if the mechanisms for abstraction differ in modern code. This is practically similar to Liskov substitution; the main difference is that there is no default implementation here.

Abstraction also applies to microservices: e.g., replace direct service-to-service calls with a message bus (Kafka, RabbitMQ) so services send to a generic place without caring which service processes the message.

## Conclusion

"Modern SOLID" in brief:

- Don't surprise the people who read your code.
- Don't surprise the people who use your code.
- Don't overwhelm the people who read your code.
- Use sane boundaries for your code.
- Use the right level of coupling—keep things together that belong together, and keep them apart if they belong apart.

Good code is good code; SOLID remains a solid basis for achieving that.
