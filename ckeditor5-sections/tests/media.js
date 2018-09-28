import { Selector } from 'testcafe';

fixture `Media integration`
    .page `../sample/index.html`;


const insert = Selector('button').withText('Insert ...');
const insertHero = Selector('button').withText('Hero');
const up = Selector('button.section-up');
const down = Selector('button.section-down');
const remove = Selector('button.section-remove');

const sections = Selector('#editor section');
const first = sections.nth(0);
const second = Selector('#editor section').nth(1);

const previewFirst = Selector('#preview section.text').nth(0);
const previewSecond = Selector('#preview section.text').nth(1);

test('Insert hero.', async t => {
  await t.click(first).click(insert).click(insertHero);
  await t.expect(second.find('button.media-select').count).eql(1);
  await t.expect(second.find('button.media-add').count).eql(1);
});

test('Select image.', async t => {
  await t.click(first).click(insert).click(insertHero).click(second);
  await t.click(second.find('button.media-select'));
  await t.expect(second.find('.ck-entity-loader').count).eql(1);
  await t.expect(second.find('.ck-entity-loader').count).eql(0);
  await t.expect(second.find('img').count).eql(1);
});

test('Upload image.', async t => {
  await t.click(first).click(insert).click(insertHero).click(second);
  await t.click(second.find('button.media-select'));
  await t.expect(second.find('.ck-entity-loader').count).eql(1);
  await t.expect(second.find('.ck-entity-loader').count).eql(0);
  await t.expect(second.find('img').count).eql(1);
});


