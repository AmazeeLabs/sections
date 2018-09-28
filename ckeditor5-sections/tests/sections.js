import { Selector } from 'testcafe';

fixture `Section handling`
  .page `../sample/index.html`;

const insert = Selector('button').withText('Insert ...');
const insertText = Selector('button').withText('Text');
const up = Selector('button.section-up');
const down = Selector('button.section-down');
const remove = Selector('button.section-remove');

const sections = Selector('#editor section.text');
const first = sections.nth(0);
const second = Selector('#editor section.text').nth(1);

const previewFirst = Selector('#preview section.text').nth(0);
const previewSecond = Selector('#preview section.text').nth(1);

test('Text section is added by default.', async t => {
  await t.expect(first.count).eql(1);

  const headline = first.find('h2');
  const text = first.find('h2');

  await t.expect(headline.count).eql(1);
  await t.expect(headline.getAttribute('contenteditable')).eql('true');
  await t.expect(text.count).eql(1);
  await t.expect(text.getAttribute('contenteditable')).eql('true')
});

test('Text section can be edited.', async t => {
  await t.expect(first.count).eql(1);

  const headline = Selector('#editor section.text h2');
  const text = Selector('#editor section.text p');

  await t.typeText(headline, 'My headline');
  await t.typeText(text, 'My text content');

  await t.expect(previewFirst.find('h2').innerText).eql('My headline');
  await t.expect(previewFirst.find('p').innerText).eql('My text content');
});

test('Add and remove another text section.', async t => {
  await t.click(first);
  await t.click(insert);
  await t.click(insertText);

  await t.expect(sections.count).eql(2);


  await t.click(first);
  await t.click(remove);

  await t.expect(sections.count).eql(1);
});

test('Move sections up and down.', async t => {

  await t.click(first);
  await t.click(insert);
  await t.click(insertText);

  await t.typeText(first.find('h2'), 'A');
  await t.click(second);
  await t.typeText(second.find('h2'), 'B');

  await t.expect(previewFirst.find('h2').innerText).eql('A');
  await t.expect(previewSecond.nth(1).find('h2').innerText).eql('B');

  await t.click(first);
  await t.click(down);

  await t.expect(previewFirst.find('h2').innerText).eql('B');
  await t.expect(previewSecond.find('h2').innerText).eql('A');

  await t.click(second);
  await t.click(up);

  await t.expect(previewFirst.find('h2').innerText).eql('A');
  await t.expect(previewSecond.find('h2').innerText).eql('B');
});


