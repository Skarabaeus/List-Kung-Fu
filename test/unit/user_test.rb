require 'test_helper'

class UserTest < ActiveSupport::TestCase

  test "check if all lists are deleted if user is deleted" do
    user = Factory(:user, :email => 'siebel.stefan@gmail.com')

    Factory(:list, :owner => user)
    Factory(:list, :owner => user)
    Factory(:list, :owner => user)

    user.destroy

    assert(List.where(:owner_id => user.id).count == 0)
  end

  test "check if all filters are deleted if user is deleted" do
    user = Factory(:user, :email => 'siebel.stefan@gmail.com')

    Factory(:filter, :user => user)
    Factory(:filter, :user => user)
    Factory(:filter, :user => user)

    user.destroy

    assert(Filter.where(:user_id => user.id).count == 0)
  end

  test "check if all tags can be accessed" do
    list = Factory(:list)

    tag1 = Factory(:tag, :user => list.owner)
    tag2 = Factory(:tag, :user => list.owner)
    tag3 = Factory(:tag, :user => list.owner)

    list.tags << tag1 << tag2 << tag3
    list.save!

    assert(list.owner.tags.count == 3)
  end
end
