import { Selector } from 'testcafe';

fixture `Basic features`
  .page `../sample/index.html`;

test('Text section is added by default and contains two editable fields.', async t => {
  await t.expect(Selector('#editor section.text').count).eql(1);

  const headline = Selector('#editor section.text h2');
  const text = Selector('#editor section.text p');

  await t.expect(headline.count).eql(1);
  await t.expect(headline.getAttribute('contenteditable')).eql('true');
  await t.expect(text.count).eql(1);
  await t.expect(text.getAttribute('contenteditable')).eql('true')
});

test('Text section can be edited and changes are reflected in the preview.', async t => {
  await t.expect(Selector('#editor section.text').count).eql(1);

  const headline = Selector('#editor section.text h2');
  const text = Selector('#editor section.text p');

  await t.typeText(headline, 'My headline');
  await t.typeText(text, 'My text content');

  await t.expect(Selector('#preview section.text h2').innerText).eql('My headline');
  await t.expect(Selector('#preview section.text p').innerText).eql('My text content');
});

test('Add and remove another text section.', async t => {
  await t.click((Selector('#editor section.text')));
  await t.click(Selector('button').withText('Insert ...'));
  await t.click(Selector('button').withText('Text'));

  await t.expect(Selector('#editor section.text').count).eql(2);

  await t.click((Selector('#editor section.text')).nth(1));
  await t.click(Selector('button.section-remove').withText('Remove section'));

  await t.expect(Selector('#editor section.text').count).eql(1);
});
