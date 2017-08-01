
function outerkey2innerkeyfunc (outerkey) {
  return outerkey;
}

function joinerContents () {
  var results = {};
  return Joiner.traverse(function (keyval) {
    results[keyval.key] = keyval.value;
  }).then(qlib.returner(results));
}


describe('Basic Test', function () {
  loadClientSide(['allex:leveldbjoiner:lib']);
  it('Create a Joiner', function () {
    var d = q.defer();
    new allex_leveldbjoinerlib(outerkey2innerkeyfunc, d);
    return setGlobal('Joiner', d.promise);
  });
  it('Join key,value', function () {
    return expect(Joiner.join('a', {first: 1}).then(joinerContents)).to.eventually.have.nested.property('a.first', 1);
  });
  it('Join keyvalue', function () {
    var contents = Joiner.joinKeyVal(['a', {second: 2}]).then(joinerContents);
    return Promise.all([
      contents.should.eventually.have.nested.property('a.first', 1),
      contents.should.eventually.have.nested.property('a.second', 2)
    ]);
  });
  it('Join many', function () {
    var contents = Joiner.joinMany([
      ['a', {third: 3}],
      ['a', {fourth: 4}],
      ['a', {fifth: 5}]
    ]).then(joinerContents);
    return Promise.all([
      contents.should.eventually.have.nested.property('a.first', 1),
      contents.should.eventually.have.nested.property('a.second', 2),
      contents.should.eventually.have.nested.property('a.third', 3),
      contents.should.eventually.have.nested.property('a.fourth', 4),
      contents.should.eventually.have.nested.property('a.fifth', 5)
    ]);
  });
  it('Destroy Joiner', function () {
    return Joiner.drop();
  });
});
