"DM Screen" app
===============

Software architecture
----------------------

### Cornerstones

- Uses web technologies (HTML, CSS and their ecosystem) and is intended to run both as a website and as a native app
- Data as kept in RAM using a "Store" (Pinia)
- Data is persisted to and from permanent storage via the interfaces made available in browsers, though using abstraction mechanisms (PouchDB)
- Import/export from documents is left to future versions and will most probably be based on JSON
- Persisting to online database is a possibility left for future versions


### Data structure

The data structure is defined in a JSON Schema document (currently in yaml format). It is based on a top-level collection of "campaigns", which contain nested objects and collections (arrays). The nesting depth is not formally limited.


### How objects are stored in RAM and on disk

In RAM (i.e. in the Store), each campaign and all its content is kept in this natural nested form (with objects being made reactive by the Store). However, for persistent storage, those objects are "flattened", meaning that arrays of sub-objects are converted to simple arrays of string ids. That process is reversed when reading objects back from the Database.

To persist an object to the Database, the Store simply passes it a reference to the object to be persisted, along with the Schema Definition for that object's type. That Definition will contain not only the type name, but also allow the Database to determine which object properties are object arrays that need to be reduced to id lists, which is the responsibility of the Database. As for the id, it is the Database's responsibility to assign one if the object is new, and the Store's responsibility not to tamper with fields added by the Database.

IMPORTANT NOTES:
  - Though Store and Database are decoupled, this architecture makes it an explicit requirement software modules or layers SHALL NOT assume that data objects are "pure". Software modules - i.e. the Store and the Database - are EXPLICITLY ALLOWED to store their own fields in any and all data objects, provided those be prefixed with the customary "_" (underline)
  - It is the DEVELOPER's responsibility to ensure that such "meta-fields" do not cause software layers to clash. At least in that sense, software layers MUST NOT be considered "black boxes".

The Database SHOULD store the type of a persisted object in a special field for debugging purposes.

To retrieve an object from the Database, the Store simply passes it its id along with its Schema definition. If the object contains nested object arrays, it is the Store's responsibility to then recursively retrieve each item of each such array.

Note: there is currently no need for a "shallow" retrieval of objects; however such a need could appear in the future, if persisting to a remote database has been implemented and collaborative editing becomes a desirable feature. 

Note #2: except for objects that have never been persisted before, which shall be persisted only upon confirmation by the user (which however may be automatic in some cases), persisting them shall be automatic after any change (triggered by input events) but "debounced" for efficiency.

### Object creation

Objects shall be created by the Store as "Drafts". The Store SHOULD, if possible, initialize a Draft with default values according to the information defined in the Schema, but MUST NOT immediately persist it to the Database (to avoid orphaned data in the Database).

Drafts can be deleted ("cancelled") anytime (Store operation CancelDraft). They MUST be valid (validated) before being committed. The Store operation CommitDraft shall be distinct from the UpdateDataObject operation.

### Object deletion

Objects can only be deleted once they've been Committed to the Store. Objects MUST NOT be deleted while they still contain non-empty nested Data Objects in arrays.

Note: it is impossible for a Data Object to be deleted before it has been persisted, and illegal (i.e. a bug) to try: only Data Objects with a valid, Database-assigned id can be Deleted.

### Object mutation

Object mutation is usually straightforward:
- Any change the user makes in the view is immediately reflected to the Data Object, which is provided by the Store, which is responsible for reactively informing all parts of the UI that are displaying the changed information in any way. The Store also internally queues a persisting operation, which will however be debounced for efficiency.
- After the debouncing delay, the Store will pass the mutated Data Object to the Database, taking care however to first converted any object arrays it may contain to simple id lists. Note: this is shallow persistence, but it risks no data loss because any changes to nested array objects MUST have been persisted BEFORE the containing Data Object can be persisted.
- Array item deletion is a somehwat special case. Nested Data Objects in arrays are considered owned by the containing object, and removing one from the array and deleting it MUST be a single operation made available by the Store: DeleteArrayObject, taking the name of the array property and the item index as parameters. It triggers two persistency operations on the Database, an Update on the containing object and a Delete on the nested object. For the sake of safety, the containing object should be updated first; that way, in case an error prevents the deletion of the nested object, that subobject would be orphaned but the active data would remain consistent.

### Object cross-references

Though it is not the case at the of writing of this document, it may become necessary for data objects to reference other objects that are not ancestors. In such cases, it becomes possible for external references to become stale.
To limit complexity, no attempt shall be made (for now) to prevent such occurrences by technical means (such as reference counting). Instead, I propose the following

RULE: any data that an object depends on must be contained within that same object or one of its ancestors. In case data from outside the ancestry is needed, that data shall be copied from its source. 

RULE #2: in app data that can be referenced from multiple data objects SHOULD have unique ids that are "forever" as well as human-readable.

### External (read-only) data

This app shall ship with a copious amount of DnD-related, static data (e.g. a "Bestiary"). As with out-of-ancestry data, it shall not be assumed that such data will always be available or that it never change, and therefore it too shall be copied, though their ids shall be preserved in the copies to support easy updates, feedback, etc.

### Client-Side Routing

- Client-side routing shall be the basis for navigation.
- Routes shall be directly derived from the Schema.
- The Breadcrumbs component shall automatically reflect the route, using additional information taken from the schema

### Views: generic and custom-made

- Two generic views shall act as fallbacks for any data routes not explicitly matched with a custom view:
  - A Generic List View shall be the fallback for both top-level and nested arrays
  - A Generic Detail View shall serve as the fallback editor for data objects

- The Generic List View shall provide a modal dialog for the purpose of creating new item objects, by allowing the user to input the required fields. Upon confirmation, the new item object shall be committed to the Store and persisted to the Database, after which it shall be added to the array, which shall then be persisted to the Store in a separate operation.

! RULE: only objects that have been persisted to the Database may be added to arrays or otherwise linked to other data objects.
