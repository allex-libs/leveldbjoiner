
function outerkey2innerkeyfunc (outerkey) {
  return outerkey;
}

function joinerContents () {
  var results = {};
  return Joiner.traverse(function (keyval) {
    results[keyval.key] = keyval.value;
  }).then(qlib.returner(results));
}


describe('Array Test', function () {
  loadClientSide(['allex:leveldbjoiner:lib']);
  it('Create a Joiner', function () {
    var d = q.defer();
    new allex_leveldbjoinerlib(outerkey2innerkeyfunc, d);
    return setGlobal('Joiner', d.promise);
  });
  it('Join key,array value', function () {
    var contents = Joiner.join('a', [{name: 'first', first: 1.1}, {name: 'second', first: 1.2}]).then(joinerContents);
    //qlib.promise2console(contents, 'beginning'); 
    return Promise.all([
      contents.should.eventually.have.nested.property('a.[0].name', 'first'),
      contents.should.eventually.have.nested.property('a.[0].first', 1.1),
      contents.should.eventually.have.nested.property('a.[1].name', 'second'),
      contents.should.eventually.have.nested.property('a.[1].first', 1.2)
    ]);
  });
  it('Join key,value', function () {
    var contents = Joiner.join('a', {something: 1, else: 2}).then(joinerContents);
    //qlib.promise2console(contents, 'after');
    return Promise.all([
      contents.should.eventually.have.nested.property('a.[0].name', 'first'),
      contents.should.eventually.have.nested.property('a.[0].first', 1.1),
      contents.should.eventually.have.nested.property('a.[0].something', 1),
      contents.should.eventually.have.nested.property('a.[0].else', 2),
      contents.should.eventually.have.nested.property('a.[1].name', 'second'),
      contents.should.eventually.have.nested.property('a.[1].first', 1.2),
      contents.should.eventually.have.nested.property('a.[1].something', 1),
      contents.should.eventually.have.nested.property('a.[1].else', 2)
    ]);
  });
  it('Join keyvalue with array value', function () {
    var contents = Joiner.joinKeyVal(['a', [{second: 2.1}, {second: 2.2}]]).then(joinerContents);
    //qlib.promise2console(contents, 'contents');
    return Promise.all([
      contents.should.eventually.have.nested.property('a.[0].first', 1.1),
      contents.should.eventually.have.nested.property('a.[0].second', 2.1),
      contents.should.eventually.have.nested.property('a.[1].first', 1.1),
      contents.should.eventually.have.nested.property('a.[1].second', 2.2),
      contents.should.eventually.have.nested.property('a.[2].first', 1.2),
      contents.should.eventually.have.nested.property('a.[2].second', 2.1),
      contents.should.eventually.have.nested.property('a.[3].first', 1.2),
      contents.should.eventually.have.nested.property('a.[3].second', 2.2)
    ]);
  });
  it('Join keyvalue with array value again', function () {
    var contents = Joiner.joinKeyVal(['a', [{third: 3.1}, {third: 3.2}]]).then(joinerContents);
    //qlib.promise2console(contents, 'again');
    return Promise.all([
      contents.should.eventually.have.nested.property('a.[0].first', 1.1),
      contents.should.eventually.have.nested.property('a.[0].second', 2.1),
      contents.should.eventually.have.nested.property('a.[0].third', 3.1),
      contents.should.eventually.have.nested.property('a.[1].first', 1.1),
      contents.should.eventually.have.nested.property('a.[1].second', 2.1),
      contents.should.eventually.have.nested.property('a.[1].third', 3.2),
      contents.should.eventually.have.nested.property('a.[2].first', 1.1),
      contents.should.eventually.have.nested.property('a.[2].second', 2.2),
      contents.should.eventually.have.nested.property('a.[2].third', 3.1),
      contents.should.eventually.have.nested.property('a.[3].first', 1.1),
      contents.should.eventually.have.nested.property('a.[3].second', 2.2),
      contents.should.eventually.have.nested.property('a.[3].third', 3.2)
    ]);
  });
  it('Join many', function () {
    var contents = Joiner.joinMany([
      ['a', {third: 3}],
      ['a', {fourth: 4}],
      ['a', {fifth: 5}]
    ]).then(joinerContents);
    //qlib.promise2console(contents, 'after many');
    return Promise.all([
      contents.should.eventually.have.nested.property('a.[0].first', 1.1),
      contents.should.eventually.have.nested.property('a.[0].second', 2.1),
      contents.should.eventually.have.nested.property('a.[0].third', 3),
      contents.should.eventually.have.nested.property('a.[1].first', 1.1),
      contents.should.eventually.have.nested.property('a.[1].second', 2.1),
      contents.should.eventually.have.nested.property('a.[1].third', 3),
      contents.should.eventually.have.nested.property('a.[2].first', 1.1),
      contents.should.eventually.have.nested.property('a.[2].second', 2.2),
      contents.should.eventually.have.nested.property('a.[2].third', 3),
      contents.should.eventually.have.nested.property('a.[3].first', 1.1),
      contents.should.eventually.have.nested.property('a.[3].second', 2.2),
      contents.should.eventually.have.nested.property('a.[3].third', 3)
    ]);
  });
  it('Destroy Joiner', function () {
    return Joiner.drop();
  });
});
