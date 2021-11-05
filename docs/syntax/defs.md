## Declaration
Declarations tell Minity how to interpret statements and where to store them, but don't include any Minecraft commands in the current function. 

## Statement
A statement is any piece of Minity code that will produce one or more Minecraft commands when compiled. This includes assignments, function calls, control structures and execution modifier constructs, as well as blocks of statements grouped with `{}` braces.

## Construct
Constructs are introduced by specific keywords, which can be followed by arguments, a statement and/or one or more clauses. Some constructs are introduced by [chainable](#chainable) keywords.

A construct is a kind of [statement](#statement).

## Clause
A clause is a specific keyword followed by a statement. Clauses are parts of constructs and are not independent statements.

## Chainable
Chainables are conditions or block macro calls that can be chained with the `and` connector. They can introduce constructs, but they are not independent statements.

## Connector
The `and` connector connects chainables. 
