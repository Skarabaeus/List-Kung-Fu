require 'test_helper'

class ListItemsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    # create a couple of list items
    user = Factory(:user)
    list = Factory(:list, :owner => user)

    Factory(:list_item, :list => list)
    Factory(:list_item, :list => list)
    Factory(:list_item, :list => list)
    Factory(:list_item, :list => list)
    Factory(:list_item, :list => list)
    Factory(:list_item, :list => list)
    @list_item = Factory(:list_item, :list => list)

  end

  test "should update list item in list item view" do
    sign_in @list_item.list.owner

    put :update, { :id => @list_item.to_param, :list_item => @list_item.attributes, :list_id => @list_item.list.id, :format => :xml }

    assert_response :success
    assert_not_nil assigns(:list_item)
    assert_not_nil assigns(:presenter)
  end

  test "should update list item in dashboard" do
    sign_in @list_item.list.owner

    list_item_hash = @list_item.attributes.merge({ :template => 'dashboard' })
    put :update, { :id => @list_item.to_param, :list_item => list_item_hash, :list_id => @list_item.list.id, :format => :xml }

    assert_response :success
    assert_not_nil assigns(:list_item)
    assert_not_nil assigns(:presenter)
  end

end
