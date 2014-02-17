# SandEdit

SandEdit is a project aiming to provide a distributed collaborative editor
based on Conflict-free Replicated Data Type (CRDT) using Node.js. CRDTs for
sequences allow to insert or delete in the sequence without the burden of
managing conflicts. It makes it ideal for real-time editing.

Eventually, the network architecture will be fully decentralized, but for now,
a membership server chooses the neighbours of each peer. Also, it does not
have restrictions on the number of users and the size of the document. 

