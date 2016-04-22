Arboretum
==========

Syntax-independent compiler framework

# What's this?

Arboretum helps you to make your own compiler with ease.

As popular, compiler is generally consist of 3 components: parser, transformer, code generator. About parser, there're some great parser generator in JavaScript environment, like PEG.js and Jison. But for later two, everybody who need those functionalities reinvent their own wheels.

Arboretum's main usage is to transform parsed ast tree. To do so, all you need to do is simply declare your ast nodes with Arboretum's JavaScript api. Then you'll get node builders and tree transformer.

And also, Arboretum supports converting your tree to another spec or just simple JavsScript values. So you can convert your own ast to some popular spec, like [estree](https://github.com/estree/estree), or generate string directly.

# Usage

See examples for [transform](https://github.com/HyeonuPark/arboretum/blob/master/test/fixture/chain2Binary.js) and [convert](https://github.com/HyeonuPark/arboretum/blob/master/test/fixture/convertSpec.js)
