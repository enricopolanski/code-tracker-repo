/*
In the context of programming, a service refers to a reusable
component or functionality that can be used by different parts
of an application. Services are designed to provide specific capabilities
and can be shared across multiple modules or components.

Services often encapsulate common tasks or operations that are needed by 
different parts of an application. They can handle complex operations,
operations, interact with external systems or APIs, manage data or perform
other specialized tasks.

Services are typically designed to be modular and decoupled from the rest
of the application. This allows them to be easily maintained, tested and
replaced without affecting the overall functionality of the application.

When working with services in Effect, it is important to understant the concept
of context: in the type `Effect<R, E, A>` the `R` parameter represents the
contextual data required by the effect to be extecuted. This contextual data
is stored in a collection called `Context`.

## Managing Services with Effects

So far, we have been working with effects that don't require any contextual data.
In those cases, the `R` parameter has always been the type `never`.

However, there are situations where we need to work with effects that depend
on specific services or context.

In this tutorial, we will learn how to:

- Create Effects that depend on a specific context.
- Work with Effects that require a context or service dependencies.
- Provide the required context to the Effect.

Understanding how to manage services and provide the necessary context to 
effects is essential for building more complex and customizable programs.
Let's dive in and explore these concepts in detail.

## Creating a simple Service

Let's start by creating a service for a random number generator.
*/
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";

interface Random {
  readonly next: () => Effect.Effect<never, never, number>;
}

const Random = Context.Tag<Random>();

/*
The code above defines an interface called `Random` that represents
our service. It has a single method called `next` that returns a random number.

The `Random` value is what is referred to as a `Tag` om Effect. 
It serves as a representation of the `Random` service and allows
`Effect` to locate and use this service at runtime.

Conceptually, we can start building a mental model of the context of an effect
by thinking of an effect by thinking of it as a `Map` of tags to services.

`Map<Tag, ServiceImpl>`
there the `Tag` acts as the "key" to the service implementation within the context.

## Using the Service

Now that we have our service instance defined, let's see how we can use it 
by building a pipeline.

*/
// Effect<random, never, void>
const program = pipe(
  Random,
  Effect.flatMap((random) => random.next()),
  Effect.flatMap((randomNumber) => Effect.logInfo(`${randomNumber}`))
);

/*

If we attempt to execute the effect without providing the necessary service:
`Effect.runSync(program)`

we will encounter a type-checking error similar to the following:

```plaintext
Argument of type `Effect<Random, never, void>` is not assignable to parameter of type `Effect<never, never, void>.
Type `Random` is not assignable to type `never`.
```

To resolve this error and successfully execute the program, we need to provide
an actual implementation of the `Random` service.

In the next section, we will explore how to implement and provide the `Random` service
to our program, enabling it to be executed.

## Providing a Service implementation

In order to provide an actual implementation of the `Random` service, we can 
utilize the `Effect.procideService` function.


*/

// Effect<never, never, void>

const runnableProgram = pipe(
  program,
  Effect.provideService(
    Random,
    Random.of({ next: () => Effect.succeed(Math.random()) })
  )
);

Effect.runSync(runnableProgram); //?