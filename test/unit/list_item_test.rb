require 'test_helper'

class ListItemTest < ActiveSupport::TestCase
  test "scope which lists all list items of a user which are not completed except unscheduled items" do
    u = Factory(:user)
    l = Factory(:list, :owner => u)
    l2 = Factory(:list, :owner => u)

    # create a couple of list items which are uncompleted
    Factory(:list_item, :list => l, :deadline => Time.zone.now + 1.day)
    Factory(:list_item, :list => l, :deadline => Time.zone.now + 1.day)
    Factory(:list_item, :list => l2, :deadline => Time.zone.now + 1.day)
    Factory(:list_item, :list => l2) #deadline == nil, meaning that item can be done "whenever"

    # and some which are completed
    Factory(:list_item, :completed => true, :list => l)
    Factory(:list_item, :completed => true, :list => l)

    list_items = ListItem.all_scheduled_uncompleted( u.id )

    assert_equal(3, list_items.count)
  end

  test "scope all lists" do
    l = Factory(:list)

    Factory(:list_item, :list => l, :deadline => Time.zone.now)
    Factory(:list_item, :list => l)
    Factory(:list_item, :list => l)
    Factory(:list_item, :list => l, :completed => true)

    list_items = ListItem.all_list l.owner_id, l.id

    assert_equal(4, list_items.count)
  end

  test "scope all lists completed" do
    l = Factory(:list)

    Factory(:list_item, :list => l, :deadline => Time.zone.now)
    Factory(:list_item, :list => l)
    Factory(:list_item, :list => l)
    Factory(:list_item, :list => l, :completed => true)

    list_items = ListItem.all_list_completed l.owner_id, l.id

    assert_equal(1, list_items.count)
  end

  test "scope all lists uncompleted" do
    l = Factory(:list)

    Factory(:list_item, :list => l, :deadline => Time.zone.now)
    Factory(:list_item, :list => l)
    Factory(:list_item, :list => l)
    Factory(:list_item, :list => l, :completed => true)

    list_items = ListItem.all_list_uncompleted l.owner_id, l.id

    assert_equal(3, list_items.count)
  end

  #----------

  test "test deadline in word today" do
    l = Factory(:list_item, :deadline => Time.zone.now)
    assert_equal( 'today', l.deadline_in_words)
  end

  test "test deadline in word tomorrow" do
    l = Factory(:list_item, :deadline => Time.zone.now.tomorrow)
    assert_equal( 'tomorrow', l.deadline_in_words)
  end

  test "test deadline in word next week" do
    l = Factory(:list_item, :deadline => Time.zone.now + 1.week + 1.day + 12.hours)
    assert_equal( 'next week', l.deadline_in_words)
  end

  test "test deadline in word whenever" do
    l = Factory(:list_item, :deadline => nil)
    assert_equal( 'whenever', l.deadline_in_words)
  end

  test "test deadline in word later" do
    t = Time.zone.now + 15.days
    l = Factory(:list_item, :deadline => t)
    assert_equal( t.strftime('%Y-%m-%d'), l.deadline_in_words)
  end

  #---------

  test "test deadline category today" do
    l = Factory(:list_item, :deadline => Time.zone.now)
    assert_equal( 'today', l.deadline_category)
  end

  test "test deadline category tomorrow" do
    l = Factory(:list_item, :deadline => Time.zone.now.tomorrow)
    assert_equal( 'tomorrow', l.deadline_category)
  end

  test "test deadline category next week" do
    l = Factory(:list_item, :deadline => Time.zone.now + 1.week + 1.day + 12.hours)
    assert_equal( 'next week', l.deadline_category)
  end

  test "test deadline category whenever" do
    l = Factory(:list_item, :deadline => nil)
    assert_equal( 'whenever', l.deadline_category)
  end

  test "test deadline category later" do
    t = Time.zone.now + 15.days
    l = Factory(:list_item, :deadline => t)
    assert_equal( t.strftime('%Y-%m-%d'), l.deadline_category)
  end

  #---------
end
