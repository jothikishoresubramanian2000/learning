# Module 37 — Classes in TypeScript

### What I learned today

I already know JS classes from Module 23 — `constructor`, methods, `extends`, `super`,
and the runtime-private `#field` syntax. This module is about everything TypeScript adds
ON TOP of that: typed property declarations, the `public`/`private`/`protected` access
modifiers (which are compile-time-only, unlike `#field`), a shortcut called "parameter
properties" that declares and assigns a constructor parameter in one move, the
`implements` keyword for checking a class against an interface's shape, and `abstract`
classes that can't be instantiated directly. My notes call this out directly as THE
NestJS layer — literally every service, controller, and guard in a real backend is shaped
like `class X implements Y { constructor(private readonly dep: Dep) {} }`, so this module
is building the exact reading skill needed for that.

### File: `class_task1.ts` — line by line

```ts
class BankAccount{
    constructor(
        public readonly accountId: string,
        public owner: string,
        private balance: number
    ){}
```
This constructor uses **parameter properties** — a TypeScript-only shortcut. Normally in
JS (Module 23) I'd have to write this as:
```ts
class BankAccount {
  accountId: string;
  owner: string;
  balance: number;
  constructor(accountId, owner, balance) {
    this.accountId = accountId;
    this.owner = owner;
    this.balance = balance;
  }
}
```
Putting an access modifier (`public`, `private`, `protected`) or `readonly` directly in
front of a constructor PARAMETER does both steps — declaring the property on the class
AND assigning `this.x = x` — automatically, with an empty `{}` body. Reading each one:
- `public readonly accountId: string` — accessible from anywhere (`public` is also the
  default if no modifier is written at all, so this one is slightly redundant but
  explicit), and `readonly` means it can never be reassigned after construction.
- `public owner: string` — accessible anywhere, can be reassigned freely.
- `private balance: number` — only accessible from CODE INSIDE this class. No modifier
  was given on the class body itself since the parameter property syntax handles the
  declaration implicitly.

```ts
    deposite(amount: number){
        this.balance += amount
        return this.balance
    }

    getBalance(){
        return this.balance
    }
}
```
Both of these methods ARE inside the class, so they're allowed to read and modify
`this.balance` directly, even though it's `private`. `getBalance()` exists specifically
BECAUSE `balance` is private — it's the sanctioned, controlled way for outside code to
read the balance without being able to set it directly.

```ts
const acc = new BankAccount("AC-01","Kishore",1000);
console.log(acc.deposite(500))
console.log(acc.getBalance())
console.log(acc.owner)
//acc.balance Property 'balance' is private and only accessible within class 'BankAccount'.
//acc.accountId = "X" Cannot assign to 'accountId' because it is a read-only property.
```
`acc.owner` works fine — `owner` is `public`. `acc.balance` is rejected — exactly the
protection `private` is for; the ONLY way to interact with it from outside is through the
class's own public methods like `getBalance()` and `deposite()`. `acc.accountId = "X"` is
rejected for a different reason — `readonly`, not privacy; `accountId` IS visible from
outside (it's `public`), it just can't be reassigned.

### File: `class_task2.ts` — line by line

```ts
interface Logger{
    info(msg:string):void,
    error(msg:string): void
}
```
An interface describing two METHODS a class must have, not properties. Each line is a
method signature: name, parameter types, return type — no body, because an interface
never has implementation, only the contract (same rule as Module 33: "interface declares,
implementation provides the body").

```ts
class ConsoleLogger implements Logger{
    info(msg: string): void{
        console.log(`INFO: ${msg}`)
    }

    error(msg: string): void {
        console.log(`ERROR: ${msg}`)
    }// tried with adding this method - Property 'error' does not exist on type 'ConsoleLogger'.
}
```
`implements Logger` is a PROMISE, checked by the compiler: `ConsoleLogger` must provide
EVERY method `Logger` declares, matching the signatures exactly. My comment on the
`error` method documents exactly what happens if that promise is broken: before I added
`error()`, trying to call `myLogger.error(...)` anywhere produced "Property 'error' does
not exist on type 'ConsoleLogger'" — TypeScript caught the missing implementation the
moment I tried to USE the missing piece, which is `implements` doing its job: it forces
completeness against the interface's contract.

```ts
const myLogger = new ConsoleLogger();
myLogger.info("Server started");
myLogger.error("db failed")
```
Both methods now exist and get called normally.

### File: `class_task3.ts` — line by line

```ts
abstract class Notification{
    abstract send(to: string): void;
    label(){
        return "Notification"
    }
}
```
`abstract class` is a base class that can hold a MIX of two kinds of members:
- `abstract send(to: string): void;` — a method with NO body at all, just a signature.
  The `abstract` keyword here means "every concrete subclass MUST provide this method,
  matching this exact signature" — similar in spirit to an interface method, but living
  inside a class.
- `label()` — a FULLY implemented, ordinary method with a real body. This is the thing an
  `interface` genuinely cannot do (interfaces never have bodies at all) — an abstract
  class can mix "must be filled in by subclasses" methods with "already works, inherited
  as-is" methods in the same class.

```ts
class EmailNotification extends Notification{
    constructor(){
        super();
    }

    send(to: string): void{
        console.log(`Email send to ${to}`)
    }
}

class SmsNotification extends Notification{
    constructor(){
        super();
    }

    send(to: string): void{
        console.log(`Sms to ${to}`)
    }
}
```
Both subclasses `extends Notification` (real inheritance now, not a constraint like
Module 36's generic `extends`) and call `super()` in their constructors (same rule as
Module 23 — a subclass constructor must call `super()` before using `this`). Both provide
their OWN `send(to: string): void` body — required, because `Notification` declared it
`abstract` and gave no implementation. Neither needs to redefine `label()` — it's
inherited as-is from `Notification`, unchanged.

```ts
const emailHandler = new EmailNotification()
const smsHandler = new SmsNotification()

// const onlyNotify = new Notification - Cannot create an instance of an abstract class.

emailHandler.send("kishore@x.com")
smsHandler.send("999999")
console.log(smsHandler.label())
```
`new Notification()` directly is blocked — the whole POINT of marking a class `abstract`
is that it's incomplete on its own (it has an unfulfilled `send` promise with no body),
so instantiating it directly would leave a caller holding an object with a method that
does nothing. Only the concrete subclasses, which fulfilled that promise, can be
instantiated. `smsHandler.label()` calls the INHERITED method and correctly returns
`"Notification"` — proving `label()` really did carry over from the abstract base without
needing to be rewritten.

### Gotchas worth remembering from this module

- **`private`/`protected` are compile-time only; `#field` (Module 23) is enforced at
  runtime.** A `private` property is genuinely still sitting there in the compiled JS
  output, accessible if someone really wanted to reach in (e.g., bypassing the type
  checker, or from plain JS code calling into compiled output) — `#field` is a real
  JavaScript-level privacy mechanism the runtime itself enforces no matter what. Both are
  "fine" to use day to day, but they're not the same strength of guarantee, and it's worth
  remembering which one I'm relying on.
- **`protected` vs `private`/`#`:** `protected` allows access from the class AND its
  subclasses, while fully blocking the outside world — `private`/`#` block even subclasses.
  None of this module's three files actually needed `protected` (everything here used
  `private` or `public`), but this distinction becomes directly relevant the moment a
  subclass needs to reach into a base class's internal state (seen concretely in Module
  40's `Store<T>`, where `data` has to be `protected`, not `private`, specifically so
  subclasses like `OrgStore` can filter it directly).
- **`implements` checks SHAPE only, inherits NO code; `extends` inherits REAL code from
  exactly one class.** `class ConsoleLogger implements Logger` gets zero code from
  `Logger` — it has to write every method itself, from scratch, and the interface only
  checks the result matches. `class EmailNotification extends Notification` DOES inherit
  real, working code (`label()`) for free. Also: a class can `implements` MULTIPLE
  interfaces at once, but can only `extends` ONE class.
- **Overriding an abstract or inherited method must keep the same SIGNATURE (same
  parameter types, same return type) — only the BODY can change.** Both `send` overrides
  in this module keep `(to: string): void` exactly; changing the return type or adding a
  parameter would break the contract `Notification` established.
- **An `abstract` class blocks direct instantiation but is NOT required to leave every
  method unimplemented** — `label()` in `Notification` proves this: `abstract` only
  prevents `new Notification()`, it doesn't force every single method to be abstract too.
